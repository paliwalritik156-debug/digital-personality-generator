const fs = require('fs');
let c = fs.readFileSync('frontend/index.html', 'utf8');

// After the ra div closes, there's an extra </div> before <!-- Email Modal
// The ra div: <div class="ra">...</div>
// Then extra: </div>
// Then: <!-- Email Modal

const oldStr = '    <button class="btn-g" onclick="loadQuiz()">🔄 Retake</button>\n  </div>\n</div>\n\n<!-- Email Modal';
const newStr = '    <button class="btn-g" onclick="loadQuiz()">🔄 Retake</button>\n  </div>\n\n<!-- Email Modal';

if (c.includes(oldStr)) {
  c = c.replace(oldStr, newStr);
  fs.writeFileSync('frontend/index.html', c);
  console.log('Fixed! Removed extra </div> after ra div');
} else {
  console.log('Pattern not found');
  // Find ra div end
  const idx = c.indexOf('🔄 Retake</button>');
  console.log('Retake at:', idx);
  console.log('Context:', JSON.stringify(c.slice(idx, idx + 100)));
}

// Verify
const c2 = fs.readFileSync('frontend/index.html', 'utf8');
const pr2 = c2.indexOf('<div id="pr"');
const em2 = c2.indexOf('<!-- Email Modal');
const sec2 = c2.slice(pr2, em2);
const opens = (sec2.match(/<div/g) || []).length;
const closes = (sec2.match(/<\/div>/g) || []).length;
console.log('After fix - opens:', opens, 'closes:', closes, 'diff:', opens - closes);
