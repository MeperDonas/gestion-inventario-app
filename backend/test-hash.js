const bcrypt = require('bcryptjs');

async function main() {
  const hashGuardado = '$2b$10$v8l5m1OUNM9OC...'; // truncado
  const password = 'Kevin123';
  
  // Generar hash fresco
  const hashFresco = await bcrypt.hash(password, 10);
  console.log('Hash guardado (truncado):', hashGuardado);
  console.log('Hash fresco de "Kevin123":', hashFresco);
  
  // Verificar
  const valido = await bcrypt.compare(password, hashFresco);
  console.log('Hash fresco válido para "Kevin123"?', valido);
}

main().catch(e => { console.error(e); process.exit(1); });
