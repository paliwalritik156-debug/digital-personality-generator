const c = require('fs').readFileSync('frontend/index.html', 'utf8');
const pr = c.slice(c.indexOf('<div id="pr"'), c.indexOf('<!-- Email Modal'));
const opens = (pr.match(/<div/g) || []).length;
const closes = (pr.match(/<\/div>/g) || []).length;
console.log('opens:', opens, 'closes:', closes, 'diff:', opens - closes);
