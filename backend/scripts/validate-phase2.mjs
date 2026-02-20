const baseUrl = process.env.BASE_URL || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const contentType = response.headers.get('content-type') || '';

  let body;
  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  return { response, body };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function login(email, password) {
  const { response, body } = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  assert(response.ok, `Login failed for ${email}`);
  const token = body?.access_token || body?.token;
  assert(Boolean(token), `Token missing for ${email}`);
  return token;
}

async function main() {
  const adminToken = await login('admin@inventory.com', 'admin123');
  const cashierToken = await login('cajero@inventory.com', 'cashier123');

  const adminHeaders = {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  };
  const cashierHeaders = {
    Authorization: `Bearer ${cashierToken}`,
    'Content-Type': 'application/json',
  };

  const productId = '123e4567-e89b-12d3-a456-426614174558';
  const customerId = '123e4567-e89b-12d3-a456-426614174777';

  const baseSalePayload = {
    customerId,
    items: [
      {
        productId,
        quantity: 1,
        unitPrice: 1,
      },
    ],
    payments: [
      {
        method: 'CASH',
        amount: 1000,
      },
    ],
  };

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const startIso = `${dateStr}T00:00:00.000Z`;
  const endIso = `${dateStr}T23:59:59.999Z`;

  const beforeDashboard = await request(
    `/reports/dashboard?startDate=${encodeURIComponent(startIso)}&endDate=${encodeURIComponent(endIso)}`,
    {
      headers: { Authorization: `Bearer ${adminToken}` },
    },
  );
  assert(beforeDashboard.response.ok, 'Failed to get dashboard baseline');
  const baselineSales = Number(beforeDashboard.body.totalSales || 0);

  const salePriceCheck = await request('/sales', {
    method: 'POST',
    headers: cashierHeaders,
    body: JSON.stringify(baseSalePayload),
  });
  assert(salePriceCheck.response.ok, 'Failed to create sale for DB price check');
  const unitPrice = Number(salePriceCheck.body.items?.[0]?.unitPrice);
  assert(unitPrice === 100, `Expected unitPrice from DB = 100, got ${unitPrice}`);

  const [saleA, saleB] = await Promise.all([
    request('/sales', {
      method: 'POST',
      headers: cashierHeaders,
      body: JSON.stringify(baseSalePayload),
    }),
    request('/sales', {
      method: 'POST',
      headers: cashierHeaders,
      body: JSON.stringify(baseSalePayload),
    }),
  ]);
  assert(saleA.response.ok && saleB.response.ok, 'Failed concurrent sales creation');
  const saleNumberA = Number(saleA.body.saleNumber);
  const saleNumberB = Number(saleB.body.saleNumber);
  assert(
    saleNumberA !== saleNumberB,
    `Expected unique saleNumber, got ${saleNumberA} and ${saleNumberB}`,
  );

  const lowStock = await request('/products/low-stock', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(lowStock.response.ok, 'Failed low-stock endpoint request');
  const lowStockHasExpected = Array.isArray(lowStock.body)
    ? lowStock.body.some((p) => p.id === '123e4567-e89b-12d3-a456-426614174669')
    : false;
  assert(lowStockHasExpected, 'Low-stock endpoint did not include expected product');

  const exportSales = await request('/exports/sales', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      format: 'csv',
      type: 'sales',
      startDate: dateStr,
      endDate: dateStr,
    }),
  });
  assert(exportSales.response.ok, 'Failed export sales with date range');
  const csvText = String(exportSales.body);
  assert(csvText.includes('Payment Method'), 'Sales CSV missing expected headers');

  const cancelTargetId = salePriceCheck.body.id;
  const cancelResult = await request(`/sales/${cancelTargetId}`, {
    method: 'PUT',
    headers: cashierHeaders,
    body: JSON.stringify({ status: 'CANCELLED' }),
  });
  assert(cancelResult.response.ok, 'Failed to cancel sale');

  const startIsoAfter = `${dateStr}T00:00:00.001Z`;
  const endIsoAfter = `${dateStr}T23:59:59.999Z`;

  const afterDashboard = await request(
    `/reports/dashboard?startDate=${encodeURIComponent(startIsoAfter)}&endDate=${encodeURIComponent(endIsoAfter)}`,
    {
      headers: { Authorization: `Bearer ${adminToken}` },
    },
  );
  assert(afterDashboard.response.ok, 'Failed to get dashboard after cancel');
  const afterSales = Number(afterDashboard.body.totalSales || 0);
  assert(
    afterSales === baselineSales + 2,
    `Expected cancelled sale excluded from KPIs. baseline=${baselineSales}, after=${afterSales}`,
  );

  console.log('PASS: unit price comes from DB');
  console.log('PASS: concurrent sales have unique saleNumber');
  console.log('PASS: low-stock endpoint includes stock <= minStock');
  console.log('PASS: exports sales date range request works');
  console.log('PASS: dashboard KPIs exclude cancelled sales');
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
