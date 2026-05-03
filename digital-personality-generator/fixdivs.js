const fs = require('fs');
let c = fs.readFileSync('frontend/index.html', 'utf8');

const pr = c.indexOf('<div id="pr"');
const em = c.indexOf('<!-- Email Modal');
const section = c.slice(pr, em);
const lines = section.split('\n');

// Line 157 (index 156) is the extra </div> before <div class="ra">
// Line 164 (index 163) is the extra </div> that closes pr too early
// We need to remove line 157 (the extra one before ra)

// Find the exact string to replace
// Context: line 155=</div>, 156=</div>, 157=</div>, 158=<div class="ra">
const oldStr = '      </div>\n    </div>\n  </div>\n  <div class="ra">';
const newStr = '      </div>\n    </div>\n  <div class="ra">';

if (c.includes(oldStr)) {
  c = c.replace(oldStr, newStr);
  fs.writeFileSync('frontend/index.html', c);
  console.log('Fixed! Removed extra </div> before ra div');
} else {
  console.log('Pattern not found, trying alternate...');
  // Try to find it differently
  const idx = c.indexOf('  </div>\n  <div class="ra">');
  if (idx !== -1) {
    console.log('Found at:', idx);
    console.log('Context:', JSON.stringify(c.slice(idx - 50, idx + 50)));
  }
}

// Verify
const c2 = fs.readFileSync('frontend/index.html', 'utf8');
const pr2 = c2.indexOf('<div id="pr"');
const em2 = c2.indexOf('<!-- Email Modal');
const sec2 = c2.slice(pr2, em2);
const opens = (sec2.match(/<div/g) || []).length;
const closes = (sec2.match(/<\/div>/g) || []).length;
console.log('After fix - opens:', opens, 'closes:', closes, 'diff:', opens - closes);
