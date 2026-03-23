const fs = require('fs');
const path = require('path');

const prismaSchemaPath = path.join(__dirname, 'backend/prisma/schema.prisma');
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');

// 1. Update guia-maestra-proyecto.md
const guiaPath = path.join(__dirname, 'docs/arquitectura/guia-maestra-proyecto.md');
let guiaContent = fs.readFileSync(guiaPath, 'utf8');

const schemaRegex = /\/\/ ENUMERACIONES[\s\S]*?@@map\("settings"\)\n\}/;
guiaContent = guiaContent.replace(schemaRegex, schemaContent.split('// Usuarios y autenticación')[1].trim());

guiaContent = guiaContent.replace('├── exports/                 # Exportación de datos (PDF, Excel)\n│   │', '├── exports/                 # Exportación de datos (PDF, Excel)\n│   ├── imports/                 # Importación masiva de datos\n│   │');
guiaContent = guiaContent.replace('useInvoice.ts', 'useReceipt.ts');

fs.writeFileSync(guiaPath, guiaContent);

// 2. Update diagrama-de-componentes.md
const diagCompMdPath = path.join(__dirname, 'docs/arquitectura/uml/generales/diagrama-de-componentes.md');
let diagCompMdContent = fs.readFileSync(diagCompMdPath, 'utf8');

diagCompMdContent = diagCompMdContent.replace('useInvoice.ts', 'useReceipt.ts');
diagCompMdContent = diagCompMdContent.replace('USE_INVOICE[useInvoice.ts]', 'USE_RECEIPT[useReceipt.ts]');
diagCompMdContent = diagCompMdContent.replace('USE_INVOICE --> API', 'USE_RECEIPT --> API');
diagCompMdContent = diagCompMdContent.replace('string invoicePrefix', 'string receiptPrefix');
diagCompMdContent = diagCompMdContent.replace('string segment', 'enum segment');

// Add Imports module
if (!diagCompMdContent.includes('ImportsModule')) {
    diagCompMdContent = diagCompMdContent.replace(
        /subgraph ExportsModule\["📤 Exports Module"\][\s\S]*?end/,
        `subgraph ExportsModule["📤 Exports Module"]
            EXP_CTRL[Exports Controller]
            EXP_SVC[Exports Service]
        end

        subgraph ImportsModule["📥 Imports Module"]
            IMP_CTRL[Imports Controller]
            IMP_SVC[Imports Service]
        end`
    );
    diagCompMdContent = diagCompMdContent.replace(
        'APP --> EXP_CTRL',
        'APP --> EXP_CTRL\n    APP --> IMP_CTRL'
    );
    diagCompMdContent = diagCompMdContent.replace(
        'EXP_SVC --> CLOUD_SVC',
        'EXP_SVC --> CLOUD_SVC\n\n    %% Conexiones Imports\n    IMP_CTRL --> IMP_SVC\n    IMP_SVC --> PRISMA'
    );
}
fs.writeFileSync(diagCompMdPath, diagCompMdContent);

// 3. Update diagrama-clases.puml
const diagClasesPath = path.join(__dirname, 'docs/arquitectura/uml/generales/diagrama-clases.puml');
let diagClasesContent = fs.readFileSync(diagClasesPath, 'utf8');

diagClasesContent = diagClasesContent.replace('String invoicePrefix', 'String receiptPrefix');
diagClasesContent = diagClasesContent.replace('String segment', 'CustomerSegment segment');

if (!diagClasesContent.includes('enum CustomerSegment')) {
    diagClasesContent = diagClasesContent.replace(
        /enum Role \{/,
        `enum CustomerSegment {
    VIP
    FREQUENT
    OCCASIONAL
    INACTIVE
}

enum Role {`
    );
}
fs.writeFileSync(diagClasesPath, diagClasesContent);

// 4. Update diagrama-de-componentes.puml
const diagCompPumlPath = path.join(__dirname, 'docs/arquitectura/uml/generales/diagrama-de-componentes.puml');
let diagCompPumlContent = fs.readFileSync(diagCompPumlPath, 'utf8');

if (!diagCompPumlContent.includes('Imports Module')) {
    diagCompPumlContent = diagCompPumlContent.replace(
        /package "Exports Module" <<Rectangle>> \{[\s\S]*?\}/,
        `package "Exports Module" <<Rectangle>> {
        [Exports Controller] as ExpCtrl #LightBlue
        [Exports Service] as ExpSvc #LightCoral
    }
    
    ' Imports Module
    package "Imports Module" <<Rectangle>> {
        [Imports Controller] as ImpCtrl #LightBlue
        [Imports Service] as ImpSvc #LightCoral
    }`
    );
    diagCompPumlContent = diagCompPumlContent.replace(
        'AppModule --> ExpCtrl',
        'AppModule --> ExpCtrl\nAppModule --> ImpCtrl'
    );
    diagCompPumlContent = diagCompPumlContent.replace(
        'ExpSvc --> CloudSvc',
        'ExpSvc --> CloudSvc\n\n\' Imports Module\nImpCtrl --> ImpSvc\nImpSvc --> PrismaSvc'
    );
}
fs.writeFileSync(diagCompPumlPath, diagCompPumlContent);

// 5. Update README modulares
const readmeModularesPath = path.join(__dirname, 'docs/arquitectura/uml/modulares/README.md');
let readmeModularesContent = fs.readFileSync(readmeModularesPath, 'utf8');
readmeModularesContent = readmeModularesContent.replace(/\.puml/g, '.md');
fs.writeFileSync(readmeModularesPath, readmeModularesContent);

console.log("Documents updated successfully.");
