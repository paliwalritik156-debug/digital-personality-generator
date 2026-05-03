const fs = require('fs');
const c = fs.readFileSync('frontend/index.html', 'utf8');

// Check pr section
const pr = c.indexOf('<div id="pr"');
const em = c.indexOf('<!-- Email Modal');
const section = c.slice(pr, em);
const opens = (section.match(/<div/g) || []).length;
const closes = (section.match(/<\/div>/g) || []).length;
console.log('pr section opens:', opens, 'closes:', closes, 'diff:', opens - closes);

// Also check page-home
const ph = c.indexOf('<div id="page-home"');
const pa = c.indexOf('<div id="pa"');
const phSection = c.slice(ph, pa);
const phOpens = (phSection.match(/<div/g) || []).length;
const phCloses = (phSection.match(/<\/div>/g) || []).length;
console.log('page-home opens:', phOpens, 'closes:', phCloses, 'diff:', phOpens - phCloses);
