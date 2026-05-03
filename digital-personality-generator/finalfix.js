const fs = require('fs');
let c = fs.readFileSync('frontend/index.html', 'utf8');

// The issue: at line 144 in pr section, </div> closes pr too early
// Lines 142-145 in pr section:
// "      </div>"  <- closes share card inner div
// "    </div>"    <- closes share card outer div  
// "  </div>"      <- THIS closes pr page (wrong! should be at end)
// "  <div class="rc w" id="pr-theme-section">"  <- personality theme (outside pr!)

// Fix: remove the </div> at line 144 of pr section, and add it at the very end of pr

const pr_start = c.indexOf('<div id="pr"');
const em_start = c.indexOf('<!-- Email Modal');
const section = c.slice(pr_start, em_start);
const lines = section.split('\n');

// Find line 144 (index 143) - the premature </div>
// Context: line 142="      </div>", 143="    </div>", 144="  </div>", 145="  <div class="rc w""
// We need to remove line 144 (index 143)

const beforeSection = c.slice(0, pr_start);
const afterSection = c.slice(em_start);

// Remove line 144 from section
lines.splice(143, 1); // remove the premature </div>

// Add </div> before <!-- Email Modal (to properly close pr)
// It's already there at line 163 (now 162 after splice)
// Actually check the new last lines
console.log('New last 5 lines of pr section:');
for (let i = lines.length - 6; i < lines.length; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

const newSection = lines.join('\n');
const newContent = beforeSection + newSection + afterSection;

// Verify
const newPr = newContent.indexOf('<div id="pr"');
const newEm = newContent.indexOf('<!-- Email Modal');
const newSec = newContent.slice(newPr, newEm);
const opens = (newSec.match(/<div/g) || []).length;
const closes = (newSec.match(/<\/div>/g) || []).length;
console.log('After fix - opens:', opens, 'closes:', closes, 'diff:', opens - closes);

if (opens === closes) {
  fs.writeFileSync('frontend/index.html', newContent);
  console.log('FIXED! File saved.');
} else {
  console.log('Still not balanced, not saving.');
}
