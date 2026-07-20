const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function simulateCreateOrg() {
  console.log('=== Simulando creación de org con password manual ===\n');
  
  // Simular lo que envía el frontend
  const dto = {
    name: 'Test Org Debug',
    slug: 'test-org-debug',
    plan: 'BASIC',
    admin: {
      name: 'Test User',
      email: 'testdebug@example.com',
      password: 'Kevin123'  // Contraseña manual
    }
  };
  
  console.log('DTO recibido:', JSON.stringify(dto, null, 2));
  console.log('dto.admin.password:', JSON.stringify(dto.admin.password));
  console.log('typeof dto.admin.password:', typeof dto.admin.password);
  console.log('dto.admin.password || "fallback":', dto.admin.password || 'fallback');
  console.log('dto.admin.password ? "truthy" : "falsy":', dto.admin.password ? 'truthy' : 'falsy');
  
  // Simular la lógica del backend
  const tempPassword = dto.admin.password || crypto.randomBytes(8).toString('hex');
  console.log('\ntempPassword asignado:', tempPassword);
  
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
  console.log('Hash generado:', hashedPassword.substring(0, 30) + '...');
  
  // Crear usuario
  const user = await prisma.user.create({
    data: {
      email: dto.admin.email,
      name: dto.admin.name,
      password: hashedPassword,
    }
  });
  
  console.log('\n✅ Usuario creado:', user.email);
  
  // Verificar que la contraseña funcione
  const isValid = await bcrypt.compare('Kevin123', user.password);
  console.log('¿"Kevin123" coincide con el hash guardado?', isValid ? '✅ SÍ' : '❌ NO');
  
  // Probar con minúscula
  const isValidLower = await bcrypt.compare('kevin123', user.password);
  console.log('¿"kevin123" coincide?', isValidLower ? '✅ SÍ' : '❌ NO');
  
  // Limpiar
  await prisma.user.delete({ where: { id: user.id } });
  console.log('\n🧹 Usuario de prueba eliminado');
  
  await prisma.$disconnect();
}

simulateCreateOrg().catch(e => { console.error(e); process.exit(1); });
