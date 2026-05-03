const fs = require('fs');
let c = fs.readFileSync('frontend/index.html', 'utf8');

const pr = c.indexOf('<div id="pr"');
const em = c.indexOf('<!-- Email Modal');
const section = c.slice(pr, em);
const lines = section.split('\n');

// Line 143 and 144 in section
console.log('Line 142:', JSON.stringify(lines[141]));
console.log('Line 143:', JSON.stringify(lines[142]));
console.log('Line 144:', JSON.stringify(lines[143]));
console.log('Line 145:', JSON.stringify(lines[144]));
console.log('Line 146:', JSON.stringify(lines[145]));
