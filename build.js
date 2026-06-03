#!/usr/bin/env node
/**
 * build.js — Deepin Garg Portfolio
 * Produces a production-ready, obfuscated dist/index.html
 * Run: node build.js
 */

const fs   = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { minify } = require('html-minifier-terser');

/* ── Anti-DevTools + right-click protection ────────────────
   Injected BEFORE the main script so it is always the first
   code to execute.
─────────────────────────────────────────────────────────── */
const shield = `
(function(){
  /* Disable right-click */
  document.addEventListener('contextmenu',function(e){e.preventDefault();return false;},{capture:true});

  /* Disable keyboard shortcuts */
  document.addEventListener('keydown',function(e){
    var k=e.keyCode||e.which;
    // F12
    if(k===123){e.preventDefault();e.stopPropagation();return false;}
    // Ctrl/Cmd + Shift + I/J/C (DevTools / Console / Inspect)
    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&(k===73||k===74||k===67)){e.preventDefault();e.stopPropagation();return false;}
    // Ctrl/Cmd + U (View Source)
    if((e.ctrlKey||e.metaKey)&&k===85){e.preventDefault();e.stopPropagation();return false;}
    // Ctrl/Cmd + S (Save Page)
    if((e.ctrlKey||e.metaKey)&&k===83){e.preventDefault();e.stopPropagation();return false;}
    // Ctrl/Cmd + P (Print / Save as PDF)
    if((e.ctrlKey||e.metaKey)&&k===80){e.preventDefault();e.stopPropagation();return false;}
  },{capture:true});

  /* Disable drag-to-copy */
  document.addEventListener('dragstart',function(e){e.preventDefault();},{capture:true});

  /* Disable text selection via keyboard */
  document.addEventListener('selectstart',function(e){
    if(!['INPUT','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();}
  });


  /* Console override — silences any output */
  try{
    var _noop=function(){};
    ['log','warn','error','info','debug','table','trace','dir','clear','group','groupEnd','groupCollapsed','count','time','timeEnd','assert'].forEach(function(m){
      try{console[m]=_noop;}catch(e){}
    });
  }catch(e){}
})();
`;

/* ── JS Obfuscator options (maximum protection) ─────────── */
const OBF_OPTIONS = {
  compact:                          true,
  controlFlowFlattening:            true,
  controlFlowFlatteningThreshold:   0.75,
  deadCodeInjection:                true,
  deadCodeInjectionThreshold:       0.4,
  debugProtection:                  true,
  debugProtectionInterval:          3000,
  disableConsoleOutput:             true,
  identifierNamesGenerator:         'hexadecimal',
  log:                              false,
  numbersToExpressions:             true,
  renameGlobals:                    false,   // keep closeNav / openNav callable from HTML
  renameProperties:                 false,   // keep data attributes safe
  rotateStringArray:                true,
  selfDefending:                    true,
  shuffleStringArray:               true,
  simplify:                         true,
  splitStrings:                     true,
  splitStringsChunkLength:          8,
  stringArray:                      true,
  stringArrayCallsTransform:        true,
  stringArrayCallsTransformThreshold: 0.75,
  stringArrayEncoding:              ['base64'],
  stringArrayIndexShift:            true,
  stringArrayRotate:                true,
  stringArrayShuffle:               true,
  stringArrayWrappersCount:         3,
  stringArrayWrappersChainedCalls:  true,
  stringArrayWrappersParametersMaxCount: 5,
  stringArrayWrappersType:          'function',
  stringArrayThreshold:             0.8,
  transformObjectKeys:              true,
  unicodeEscapeSequence:            false,
  sourceMap:                        false,
};

/* ── HTML minifier options ───────────────────────────────── */
const MINIFY_OPTIONS = {
  collapseWhitespace:            true,
  collapseInlineTagWhitespace:   true,
  conservativeCollapse:          false,
  removeComments:                true,
  removeRedundantAttributes:     true,
  removeScriptTypeAttributes:    true,
  removeStyleLinkTypeAttributes: true,
  removeEmptyAttributes:         true,
  useShortDoctype:               true,
  minifyCSS:                     true,
  minifyJS:                      false,   // already obfuscated
  processConditionalComments:    true,
};

/* ── Main build ─────────────────────────────────────────── */
async function build() {
  console.log('\n🔨  Building portfolio...\n');

  const srcPath  = path.join(__dirname, 'index.html');
  const distDir  = path.join(__dirname, 'dist');
  const distPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(srcPath)) {
    console.error('❌  index.html not found'); process.exit(1);
  }

  let html = fs.readFileSync(srcPath, 'utf8');

  /* Extract the last <script>…</script> block */
  const SCRIPT_RE = /<script>([\s\S]*?)<\/script>\s*<\/body>\s*<\/html>\s*$/;
  const match = html.match(SCRIPT_RE);
  if (!match) {
    console.error('❌  Could not find <script> block'); process.exit(1);
  }
  const originalJS = match[1].trim();

  /* Combine shield + original JS */
  const combined = shield + '\n' + originalJS;

  /* Obfuscate */
  console.log('  🔒  Obfuscating JavaScript…');
  let obfuscated;
  try {
    obfuscated = JavaScriptObfuscator
      .obfuscate(combined, OBF_OPTIONS)
      .getObfuscatedCode();
  } catch (err) {
    console.error('❌  Obfuscation failed:', err.message);
    process.exit(1);
  }
  console.log(`      JS: ${(originalJS.length/1024).toFixed(1)} KB → ${(obfuscated.length/1024).toFixed(1)} KB`);

  /* Splice obfuscated JS back into HTML */
  html = html.replace(SCRIPT_RE,
    `<script>${obfuscated}</script></body></html>`
  );

  /* Minify HTML + inline CSS */
  console.log('  🗜   Minifying HTML & CSS…');
  let output;
  try {
    output = await minify(html, MINIFY_OPTIONS);
  } catch (err) {
    console.error('❌  Minification failed:', err.message);
    process.exit(1);
  }

  /* Write output */
  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(distPath, output, 'utf8');

  /* Stats */
  const srcSize  = Buffer.byteLength(fs.readFileSync(srcPath),  'utf8');
  const outSize  = Buffer.byteLength(output, 'utf8');
  console.log(`\n✅  Done!`);
  console.log(`   Source  : ${(srcSize/1024).toFixed(1)} KB`);
  console.log(`   Output  : ${(outSize/1024).toFixed(1)} KB`);
  console.log(`   Saved to: dist/index.html\n`);
}

build().catch(err => { console.error(err); process.exit(1); });
