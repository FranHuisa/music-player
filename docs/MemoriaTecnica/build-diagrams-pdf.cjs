/**
 * Renders DIAGRAMAS_FLUJO.md → PDF with Mermaid diagrams as real SVG images.
 * Steps:
 *   1. Read the MD file.
 *   2. Extract every ```mermaid block, write each to a temp .mmd file.
 *   3. Run mmdc (mermaid-cli) on each .mmd → .svg using system Chrome.
 *   4. Build HTML replacing mermaid code blocks with inline <img src="data:..."> SVGs.
 *   5. Run Chrome headless to print the HTML → PDF.
 */
const { marked }   = require('marked');
const fs           = require('fs');
const path         = require('path');
const { execSync } = require('child_process');
const os           = require('os');

const DIR        = path.dirname(__filename);
const MD_FILE    = path.join(DIR, 'DIAGRAMAS_FLUJO.md');
const PDF_FILE   = path.join(DIR, 'DIAGRAMAS_FLUJO.pdf');
const HTML_FILE  = path.join(DIR, '_diagramas_tmp.html');
const CHROME     = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PPTR_CFG   = path.join(DIR, 'puppeteer.config.cjs');
const TMPDIR     = path.join(os.tmpdir(), 'mermaid_build_' + Date.now());
fs.mkdirSync(TMPDIR, { recursive: true });

const CSS = `
  body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6;
         color: #1a1a1a; max-width: 860px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 20pt; border-bottom: 2px solid #333; padding-bottom: 6px; }
  h2 { font-size: 15pt; border-bottom: 1px solid #ccc; margin-top: 28px; }
  h3 { font-size: 12pt; margin-top: 20px; color: #222; }
  code { background:#f4f4f4; padding:2px 5px; border-radius:3px;
         font-family:'Courier New',monospace; font-size:9.5pt; }
  pre  { background:#f4f4f4; padding:12px; border-radius:4px;
         border-left:3px solid #4a9eff; }
  pre code { background:none; padding:0; font-size:9pt; }
  blockquote { border-left:4px solid #ccc; margin:0; padding:8px 16px;
               color:#555; background:#fafafa; }
  hr  { border:none; border-top:1px solid #ddd; margin:24px 0; }
  ul, ol { padding-left:24px; }
  li  { margin:4px 0; }
  .mermaid-img { display:block; margin:16px auto; max-width:90%;
                 border:1px solid #e0e0e0; border-radius:6px;
                 background:#fff; padding:8px; }
  @page { size: A4; margin: 20mm; }
`;

// ── 1. Read markdown (normalize CRLF → LF) ────────────────────────────────────
const md = fs.readFileSync(MD_FILE, 'utf8').replace(/\r\n/g, '\n');

// ── 2. Extract mermaid blocks and render to SVG ───────────────────────────────
const mermaidRE = /```mermaid\n([\s\S]*?)```/g;
const svgMap    = new Map(); // placeholder → base64 SVG data URI
let   match;
let   idx = 0;

const allMatches = [...md.matchAll(mermaidRE)];
console.log(`Found ${allMatches.length} Mermaid diagrams.`);

for (const m of allMatches) {
  const diagramSrc = m[1];
  const placeholder = `__MERMAID_${idx}__`;
  const mmdFile     = path.join(TMPDIR, `diagram_${idx}.mmd`);
  const svgFile     = path.join(TMPDIR, `diagram_${idx}.svg`);

  fs.writeFileSync(mmdFile, diagramSrc, 'utf8');

  try {
    execSync(
      `npx --yes @mermaid-js/mermaid-cli mmdc ` +
      `-i "${mmdFile}" -o "${svgFile}" ` +
      `--puppeteerConfigFile "${PPTR_CFG}" ` +
      `-b transparent`,
      { timeout: 60000, stdio: 'pipe' }
    );

    if (fs.existsSync(svgFile)) {
      const svgData = fs.readFileSync(svgFile, 'utf8');
      // Embed as inline base64 data URI so the HTML is self-contained
      const b64 = Buffer.from(svgData).toString('base64');
      svgMap.set(placeholder, `data:image/svg+xml;base64,${b64}`);
      console.log(`  ✓ Diagram ${idx} rendered (${Math.round(svgData.length / 1024)} KB SVG)`);
    } else {
      console.warn(`  ✗ Diagram ${idx}: SVG file not created`);
      svgMap.set(placeholder, null);
    }
  } catch (e) {
    console.warn(`  ✗ Diagram ${idx} error: ${e.message.slice(0, 120)}`);
    svgMap.set(placeholder, null);
  }
  idx++;
}

// ── 3. Replace mermaid blocks in MD with placeholders, convert to HTML ────────
let mdWithPlaceholders = md;
let i = 0;
mdWithPlaceholders = mdWithPlaceholders.replace(mermaidRE, () => {
  return `__MERMAID_${i++}__`;
});

let html = marked(mdWithPlaceholders);

// ── 4. Replace placeholders with <img> tags (or fallback code block) ──────────
i = 0;
for (const [placeholder, dataUri] of svgMap) {
  if (dataUri) {
    html = html.replace(
      new RegExp(placeholder.replace(/__/g, '__'), 'g'),
      `<img class="mermaid-img" src="${dataUri}" alt="Diagrama ${i}" />`
    );
  } else {
    html = html.replace(
      new RegExp(placeholder.replace(/__/g, '__'), 'g'),
      `<p><em>[Diagrama ${i} — no se pudo renderizar]</em></p>`
    );
  }
  i++;
}

// ── 5. Wrap in full HTML document ─────────────────────────────────────────────
const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Diagramas de Flujo — MusicPlayer</title>
  <style>${CSS}</style>
</head>
<body>
${html}
</body>
</html>`;

fs.writeFileSync(HTML_FILE, fullHtml, 'utf8');
console.log(`\nHTML written (${Math.round(fullHtml.length / 1024)} KB): ${HTML_FILE}`);

// ── 6. Chrome headless → PDF ──────────────────────────────────────────────────
const fileUrl = 'file:///' + HTML_FILE.replace(/\\/g, '/');
const cmd = `"${CHROME}" --headless=new --disable-gpu --no-sandbox ` +
            `--print-to-pdf="${PDF_FILE}" --print-to-pdf-no-header "${fileUrl}"`;

console.log('Generating PDF...');
execSync(cmd, { timeout: 60000 });
console.log(`PDF written: ${PDF_FILE} (${Math.round(fs.statSync(PDF_FILE).size / 1024)} KB)`);

// ── 7. Cleanup ────────────────────────────────────────────────────────────────
fs.unlinkSync(HTML_FILE);
fs.rmSync(TMPDIR, { recursive: true, force: true });
console.log('Done.');
