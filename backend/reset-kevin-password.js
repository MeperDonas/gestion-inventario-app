const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const newPassword = 'Kevin123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const updated = await prisma.user.update({
    where: { email: 'kevin123@gmail.com' },
    data: { password: hashedPassword }
  });
  
  console.log('✅ Contraseña actualizada para:', updated.email);
  console.log('   Nueva contraseña:', newPassword);
  
  // Verificar
  const user = await prisma.user.findUnique({
    where: { email: 'kevin123@gmail.com' }
  });
  
  const isValid = await bcrypt.compare(newPassword, user.password);
  console.log('   Verificación:', isValid ? '✅ OK' : '❌ FAIL');
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
