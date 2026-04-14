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
        let content = fs.readFileSync(file, 'utf8');
        
        let newContent = content.replace(/className=\"font-bold\"/g, "className='font-bold'");
        // Only do this if it fixes literal strings. Wait, replacing ALL className="font-bold" to className='font-bold' is completely valid JSX and valid JS Strings!
        // JSX accepts single quotes!
        
        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Fixed quotes in: ${file}`);
        }
    });
});
console.log("Done");
