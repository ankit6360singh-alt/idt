import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/Win11/OneDrive/Documents/idt2/backend';

function checkImports(file) {
    console.log(`Checking ${file}...`);
    try {
        const content = fs.readFileSync(file, 'utf-8');
        const importRegex = /import.*?from\s+['"](.*?)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];
            if (importPath.startsWith('.')) {
                const absolutePath = path.resolve(path.dirname(file), importPath);
                const extensions = ['', '.js', '/index.js'];
                let found = false;
                for (const ext of extensions) {
                    if (fs.existsSync(absolutePath + ext)) {
                        found = true;
                        if (fs.lstatSync(absolutePath + ext).isFile()) {
                            checkImports(absolutePath + ext);
                        }
                        break;
                    }
                }
                if (!found) {
                    console.error(`❌ Module NOT FOUND: ${importPath} in ${file}`);
                    console.error(`   Looked as: ${absolutePath}`);
                }
            } else {
                // assume node_modules
            }
        }
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
}

checkImports(path.join(baseDir, 'server.js'));
