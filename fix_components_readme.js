const fs = require('fs');
const path = require('path');

const readmePath = path.join(__dirname, 'docs/arquitectura/uml/modulares/componentes/README.md');
let content = fs.readFileSync(readmePath, 'utf8');

if (!content.includes('### Módulo de Importaciones')) {
    content = content.replace(
        '### Módulo de Reportes',
        `### Módulo de Importaciones
\`\`\`
ImportsController
├── ImportsService
│   └── PrismaService
└── DTOs (Import, RetryRow)
\`\`\`

**Endpoints:**
- GET /imports/products/template
- POST /imports/products
- GET /imports/:jobId/status
- POST /imports/:jobId/retry-row

### Módulo de Reportes`
    );
    fs.writeFileSync(readmePath, content);
    console.log('Added Módulo de Importaciones to README');
}
