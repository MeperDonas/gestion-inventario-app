const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'docs/arquitectura/uml/generales/diagrama-casos-de-uso.md');
let mdContent = fs.readFileSync(mdPath, 'utf8');

if (!mdContent.includes('Modulo_Importaciones')) {
    mdContent = mdContent.replace(
        /subgraph Modulo_Exportaciones\["Modulo de Exportaciones"\][\s\S]*?end/,
        `subgraph Modulo_Exportaciones["Modulo de Exportaciones"]
            UC36[Exportar Ventas a PDF/Excel]
            UC37[Exportar Productos]
            UC38[Exportar Clientes]
            UC39[Exportar Inventario]
        end

        subgraph Modulo_Importaciones["Modulo de Importaciones"]
            UC46[Descargar Plantilla de Productos]
            UC47[Importar Archivo Excel/CSV]
            UC48[Ver Estado de Importacion]
            UC49[Reintentar Fila Fallida]
        end`
    );

    mdContent = mdContent.replace(
        'A --> UC39',
        'A --> UC39\n    A --> UC46\n    A --> UC47\n    A --> UC48\n    A --> UC49'
    );
    
    mdContent = mdContent.replace(
        'I --> UC39',
        'I --> UC39\n    I --> UC46\n    I --> UC47\n    I --> UC48\n    I --> UC49'
    );

    mdContent = mdContent.replace(
        /### 2.8 Modulo de Configuracion/,
        `### 2.8 Modulo de Importaciones

| ID | Caso de Uso | Actor(es) | Descripcion |
|----|-------------|-----------|-------------|
| UC46 | Descargar Plantilla | Admin, Inventario | Descargar formato base en Excel/CSV |
| UC47 | Importar Archivo | Admin, Inventario | Subir y procesar archivo de migracion |
| UC48 | Ver Estado | Admin, Inventario | Monitorear el progreso de importacion |
| UC49 | Reintentar Fila | Admin, Inventario | Corregir datos erroneos de importacion |

### 2.9 Modulo de Configuracion`
    );

    mdContent = mdContent.replace(
        /### 2.9 Modulo de Auditoria/,
        `### 2.10 Modulo de Auditoria`
    );

    mdContent = mdContent.replace(
        /\| \*\*Exportaciones\*\* \| Todas \| - \| Productos\/Inventario \|/,
        `| **Exportaciones** | Todas | - | Productos/Inventario |
| **Importaciones** | Todas | - | Productos/Inventario |`
    );
    
    fs.writeFileSync(mdPath, mdContent);
    console.log("Updated diagrama-casos-de-uso.md");
}

const pumlPath = path.join(__dirname, 'docs/arquitectura/uml/generales/diagrama-casos-de-uso.puml');
let pumlContent = fs.readFileSync(pumlPath, 'utf8');

if (!pumlContent.includes('Modulo_Importaciones')) {
    pumlContent = pumlContent.replace(
        /package "Modulo de Exportaciones" <<Modulo>> \{[\s\S]*?\}/,
        `package "Modulo de Exportaciones" <<Modulo>> {
        usecase "UC36: Exportar Ventas a PDF/Excel" as UC36
        usecase "UC37: Exportar Productos" as UC37
        usecase "UC38: Exportar Clientes" as UC38
        usecase "UC39: Exportar Inventario" as UC39
    }

    ' Modulo de Importaciones
    package "Modulo de Importaciones" <<Modulo>> {
        usecase "UC46: Descargar Plantilla" as UC46
        usecase "UC47: Importar Archivo Excel/CSV" as UC47
        usecase "UC48: Ver Estado Importacion" as UC48
        usecase "UC49: Reintentar Fila" as UC49
    }`
    );

    pumlContent = pumlContent.replace(
        'Admin --> UC39',
        'Admin --> UC39\n\n' +
        'Admin --> UC46\nAdmin --> UC47\nAdmin --> UC48\nAdmin --> UC49'
    );
    
    pumlContent = pumlContent.replace(
        'InvUser --> UC39',
        'InvUser --> UC39\n\n' +
        'InvUser --> UC46\nInvUser --> UC47\nInvUser --> UC48\nInvUser --> UC49'
    );

    fs.writeFileSync(pumlPath, pumlContent);
    console.log("Updated diagrama-casos-de-uso.puml");
}
