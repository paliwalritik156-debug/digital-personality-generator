const fs = require('fs');
const c = fs.readFileSync('frontend/index.html', 'utf8');
const pr = c.indexOf('<div id="pr"');
const em = c.indexOf('<!-- Email Modal');
const section = c.slice(pr, em);
const lines = section.split('\n');
let depth = 0;
// Show all lines where depth changes significantly
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const o = (line.match(/<div/g) || []).length;
  const cl = (line.match(/<\/div>/g) || []).length;
  const prev = depth;
  depth += o - cl;
  // Show first 5 lines, last 20 lines, and any depth=1 transitions
  if (i < 5 || i >= lines.length - 20 || (prev > 1 && depth === 1) || depth <= 0) {
    console.log(`${i+1} d=${depth}: ${line.trim().slice(0, 70)}`);
  }
}
console.log('FINAL depth:', depth);
