const fs = require('fs');
const c = fs.readFileSync('frontend/index.html', 'utf8');
const pr = c.indexOf('<div id="pr"');
const em = c.indexOf('<!-- Email Modal');
const section = c.slice(pr, em);
const lines = section.split('\n');
let depth = 0;
const problems = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const o = (line.match(/<div/g) || []).length;
  const cl = (line.match(/<\/div>/g) || []).length;
  depth += o - cl;
  if (depth < 0) {
    problems.push({ line: i + 1, depth, content: line.trim().slice(0, 100) });
    depth = 0; // reset to continue
  }
}
console.log('Problem lines:');
problems.forEach(p => console.log(`  Line ${p.line} (depth=${p.depth}): ${p.content}`));
