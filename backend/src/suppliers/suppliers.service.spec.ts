import { SuppliersService } from './suppliers.service';

describe('SuppliersService', () => {
  let service: SuppliersService;

  const prismaMock = {
    supplier: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    purchaseOrder: {
      count: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SuppliersService(prismaMock as never);
  });

  it('deactivates suppliers even when they have historical purchase orders', async () => {
    const existingSupplier = {
      id: 'supplier-1',
      name: 'Proveedor Andino',
      documentNumber: '900123456',
      email: 'andino@example.com',
      phone: null,
      address: null,
      contactName: null,
      active: true,
      createdAt: new Date('2026-04-19T10:00:00.000Z'),
      updatedAt: new Date('2026-04-19T10:00:00.000Z'),
    };

    prismaMock.supplier.findUnique.mockResolvedValue(existingSupplier);
    prismaMock.supplier.update.mockResolvedValue({
      ...existingSupplier,
      active: false,
    });
    prismaMock.purchaseOrder.count.mockResolvedValue(3);

    await expect(service.remove('supplier-1')).resolves.toEqual(
      expect.objectContaining({ id: 'supplier-1', active: false }),
    );

    expect(prismaMock.supplier.update).toHaveBeenCalledWith({
      where: { id: 'supplier-1' },
      data: { active: false },
    });
    expect(prismaMock.purchaseOrder.count).not.toHaveBeenCalled();
  });
});
