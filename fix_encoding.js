const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// These are the EXACT strings as they appear in the file (mojibake):
// "â€"" is the mojibake for em-dash
// "ðŸ‡¨ðŸ‡³" etc. are mojibake for flag emoji
// We'll replace with safe HTML entities

const fixes = [
  // em dash mojibake -> HTML entity
  // The mojibake sequence looks like "â€"" — find it by building the exact chars
  // JSON: "\u00e2\u0080\u009c" is NOT the right sequence — let's find what IS in the file
  // From JSON.stringify output: â€" appears as the literal 3-char sequence
  // We need to match the raw UTF-8 string representation as stored
];

// Strategy: use Buffer to find and replace byte sequences
const buf = fs.readFileSync('index.html');

// The "â€"" mojibake for em-dash is bytes: C3 A2 E2 82 AC E2 80 9D (UTF-8 of the latin1 misread chars)
// Actually from our earlier byte analysis: e2 82 ac e2 80 9d sequence may vary 
// Let's just do string replacement on the utf8 read

// Replace em-dash mojibake
// Reading the file as utf8 gives us the mojibake as actual unicode points
// "â" = U+00E2, "€" = U+20AC (or U+0080 depending on encoding), """ = U+201D
// Let's check what we actually have by looking at char codes

const idx = content.indexOf('Risk Analyzer');
const surroundStr = content.slice(idx - 20, idx);
const charCodes = [...surroundStr].map(c => c.codePointAt(0).toString(16).toUpperCase()).join(' ');
console.log('Chars before "Risk Analyzer":', charCodes);
console.log('As string:', surroundStr);

// The title line should contain "Supply Chain " + mojibake + " Risk"
// Find the exact mojibake sequence
const titleMatch = content.match(/Supply Chain (.{1,10}) Risk Analyzer/);
if (titleMatch) {
  const badSeq = titleMatch[1];
  const codes = [...badSeq].map(c => c.codePointAt(0).toString(16)).join('-');
  console.log('Bad sequence char codes:', codes);
  console.log('Bad sequence chars:', badSeq);
  
  // Replace with HTML entity
  content = content.replace(badSeq, '&mdash;');
  console.log('Replaced em-dash in title!');
}

// Same for the badge line
const badgeMatch = content.match(/Multi-Agent AI System (.{1,10}) 6 Specialized/);
if (badgeMatch) {
  const badSeq = badgeMatch[1];
  content = content.replace(badSeq, '&mdash;');
  console.log('Replaced em-dash in badge!');
}

// For quick-chip flag emojis, replace before SHA-LAX etc.
// The pattern before "SHA-LAX" contains mojibake emoji flags
// Just replace the entire button text
content = content.replace(/>[^<]*SHA-LAX<\/button>/, '>CN &rarr; US &nbsp;SHA-LAX<\/button>');
content = content.replace(/>[^<]*RTM-SIN<\/button>/, '>NL &rarr; SG &nbsp;RTM-SIN<\/button>');
content = content.replace(/>[^<]*SIN-RTM<\/button>/, '>SG &rarr; NL &nbsp;SIN-RTM<\/button>');
content = content.replace(/>[^<]*SHA-PSD<\/button>/, '>CN &rarr; EG &nbsp;SHA-PSD<\/button>');

console.log('Replaced quick chip labels!');

fs.writeFileSync('index.html', content, 'utf8');
console.log('\nDone! Verify:');
console.log(content.match(/<title>(.*?)<\/title>/)[1]);
console.log(content.match(/SHA-LAX<\/button>/) ? 'SHA-LAX button OK' : 'SHA-LAX button missing!');
