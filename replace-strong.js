const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const dirs = ['./app', './components'];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = walk(dir);
    files.forEach(file => {
        let originalContent = fs.readFileSync(file, 'utf8');
        
        let newContent = originalContent
            .replace(/<strong\b([^>]*)>/gi, '<span$1 className="font-bold">')
            .replace(/<\/strong>/gi, '</span>')
            .replace(/className="font-bold"\s+className="/g, 'className="font-bold ')
            .replace(/className="([^"]*)"\s+className="font-bold"/g, 'className="$1 font-bold"');

        // Special cleanup for duplicates created if it already had className
        newContent = newContent.replace(/<span\s+className="([^"]+)"\s+className="([^"]+)">/g, (match, cl1, cl2) => {
            return `<span className="${cl1} ${cl2}">`;
        });

        if (originalContent !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Updated strong tags in: ${file}`);
        }
    });
});
console.log("Done");
