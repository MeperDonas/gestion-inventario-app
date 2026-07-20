const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Verificar qué hash tenía Kevin ORIGINALMENTE (antes de que yo lo reseteara)
  // Buscar en audit logs o simplemente preguntar: ¿qué contraseña tenía?
  
  const user = await prisma.user.findUnique({
    where: { email: 'kevin123@gmail.com' }
  });
  
  if (!user) {
    console.log('Usuario no encontrado');
    await prisma.$disconnect();
    return;
  }
  
  console.log('Hash actual:', user.password);
  
  // Probar SIEMPRE la contraseña aleatoria típica
  const commonPasswords = ['password', '123456', 'admin', 'test', 'password123', '12345678'];
  for (const pwd of commonPasswords) {
    const valid = await bcrypt.compare(pwd, user.password);
    if (valid) console.log(`¡Coincide con: "${pwd}"!`);
  }
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
