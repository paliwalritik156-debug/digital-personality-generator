const fs = require('fs');
const c = fs.readFileSync('frontend/index.html', 'utf8');
const pr = c.indexOf('<div id="pr"');
const em = c.indexOf('<!-- Email Modal');
const section = c.slice(pr, em);
const lines = section.split('\n');
// Show lines 150-170
for (let i = 149; i < Math.min(170, lines.length); i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
