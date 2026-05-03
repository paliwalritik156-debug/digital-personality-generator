const fs = require('fs');
const c = fs.readFileSync('frontend/index.html', 'utf8');
const pr = c.indexOf('<div id="pr"');
const em = c.indexOf('<!-- Email Modal');
const section = c.slice(pr, em);
const lines = section.split('\n');
let depth = 0;
let maxDepth = 0;
let maxLine = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const o = (line.match(/<div/g) || []).length;
  const cl = (line.match(/<\/div>/g) || []).length;
  depth += o - cl;
  if (depth > maxDepth) { maxDepth = depth; maxLine = i; }
}
console.log('Final depth:', depth);
console.log('Max depth was:', maxDepth, 'at line:', maxLine + 1);
// Show last 20 lines
console.log('\nLast 20 lines:');
for (let i = Math.max(0, lines.length - 20); i < lines.length; i++) {
  const o = (lines[i].match(/<div/g) || []).length;
  const cl = (lines[i].match(/<\/div>/g) || []).length;
  console.log(`${i+1} [${o}-${cl}]: ${lines[i].trim().slice(0, 80)}`);
}
