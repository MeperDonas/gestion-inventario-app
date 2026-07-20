const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // 1. Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email: 'kevin123@gmail.com' },
    include: { organizationUsers: true }
  });
  
  if (!user) {
    console.log('❌ Usuario NO encontrado en BD');
    await prisma.$disconnect();
    return;
  }
  
  console.log('✅ Usuario encontrado:', user.email);
  console.log('   Name:', user.name);
  console.log('   Active:', user.active);
  console.log('   isSuperAdmin:', user.isSuperAdmin);
  console.log('   Hash:', user.password.substring(0, 20) + '...');
  console.log('   OrganizationUsers:', user.organizationUsers.length);
  
  if (user.organizationUsers.length > 0) {
    const ou = user.organizationUsers[0];
    console.log('   Org ID:', ou.organizationId);
    console.log('   Role:', ou.role);
    console.log('   isPrimaryOwner:', ou.isPrimaryOwner);
    
    // Verificar la org
    const org = await prisma.organization.findUnique({
      where: { id: ou.organizationId }
    });
    console.log('   Org Name:', org?.name);
    console.log('   Org Status:', org?.status);
    console.log('   Org Active:', org?.active);
  }
  
  // 2. Probar contraseñas
  const passwordsToTest = ['Kevin123', 'kevin123', 'Kevin1234', 'admin123'];
  
  for (const pwd of passwordsToTest) {
    const isValid = await bcrypt.compare(pwd, user.password);
    console.log(`   Password "${pwd}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
  }
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
