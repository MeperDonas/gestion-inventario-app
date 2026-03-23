const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(path.join(__dirname, 'docs/arquitectura'), function(filePath) {
    if (filePath.endsWith('.md') || filePath.endsWith('.puml')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        
        content = content.replace(/facturación/g, "generación de recibos");
        content = content.replace(/Facturación/g, "Generación de Recibos");
        content = content.replace(/facturas/g, "recibos");
        content = content.replace(/Facturas/g, "Recibos");
        content = content.replace(/factura/g, "recibo");
        content = content.replace(/Factura/g, "Recibo");
        
        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log("Updated: " + filePath);
        }
    }
});
