const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const INPUT = path.resolve(__dirname, '../docs/MemoriaTecnica/DIAGRAMAS_FLUJO.md');
const OUTPUT = path.resolve(__dirname, '../docs/MemoriaTecnica/DIAGRAMAS_FLUJO.pdf');

const content = fs.readFileSync(INPUT, 'utf8');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mermaid-'));

let counter = 0;
const blocks = [];
const placeholder = content.replace(/```mermaid\r?\n([\s\S]*?)```/g, (_, code) => {
  blocks.push(code.trim());
  return `@@MERMAID_${counter++}@@`;
});

console.log(`Encontrados ${blocks.length} diagramas Mermaid. Convirtiendo...`);

const MYSQL_PNG = path.resolve(__dirname, '../docs/MemoriaTecnica/diagrama5pngMYSQL.png');
const SQL_FILE = path.resolve(__dirname, '../docs/MemoriaTecnica/diagrama5_components.sql');

const imagePaths = blocks.map((code, i) => {
  const mmdFile = path.join(tempDir, `d${i}.mmd`);
  const pngFile = path.join(tempDir, `d${i}.png`);
  fs.writeFileSync(mmdFile, code);

  const r = spawnSync('npx', ['@mermaid-js/mermaid-cli', '-i', mmdFile, '-o', pngFile, '-b', 'white', '-t', 'default', '-w', '900'], {
    shell: true,
    encoding: 'utf8',
    timeout: 60000,
  });

  if (r.status !== 0) {
    console.error(`  ✗ Diagrama ${i + 1} falló:`, r.stderr?.slice(0, 200));
    if (i === 4) {
      console.log('  ✓ Diagrama 5 → usando solo PNG de MySQL Workbench');
    }
    return null;
  }

  console.log(`  ✓ Diagrama ${i + 1} generado`);
  return pngFile;
});

// Add mermaid.live note at top
const liveNote = `> 💡 Edita o prueba cualquier diagrama en **[mermaid.live](https://mermaid.live)** — pega el código Mermaid del bloque correspondiente.\n\n`;
let final = liveNote + placeholder;

const sqlContent = fs.existsSync(SQL_FILE) ? fs.readFileSync(SQL_FILE, 'utf8') : '';

for (let i = 0; i < blocks.length; i++) {
  const entry = imagePaths[i];
  let replacement;

  const codeBlock = `\`\`\`\n${blocks[i]}\n\`\`\`\n`;
  replacement = `\n\n${codeBlock}\n`;

  if (entry && fs.existsSync(entry)) {
    const b64 = fs.readFileSync(entry).toString('base64');
    replacement += `![Diagrama ${i + 1}](data:image/png;base64,${b64})\n\n`;
  } else {
    replacement += `*(Error al renderizar diagrama ${i + 1})*\n\n`;
  }

  if (i === 4) {
    if (fs.existsSync(MYSQL_PNG)) {
      const b64png = fs.readFileSync(MYSQL_PNG).toString('base64');
      replacement += `**Diagrama MySQL Workbench (Reverse Engineer):**\n\n![Diagrama MySQL Workbench](data:image/png;base64,${b64png})\n\n`;
    }
    if (sqlContent) {
      replacement += `**Script MySQL** — ejecutar en MySQL Workbench → Database > Reverse Engineer:\n\n\`\`\`sql\n${sqlContent}\n\`\`\`\n`;
    }
  }
  final = final.split(`@@MERMAID_${i}@@`).join(replacement);
}

const processedMd = path.join(tempDir, 'DIAGRAMAS_FLUJO.md');
fs.writeFileSync(processedMd, final);

const cssFile = path.join(tempDir, 'diagrams.css');
fs.writeFileSync(
  cssFile,
  `
  body { font-family: sans-serif; font-size: 13px; }
  h2 { margin-top: 1.2rem; margin-bottom: 0.4rem; break-after: avoid !important; page-break-after: avoid !important; }
  h2 + p, h2 + div { break-before: avoid !important; page-break-before: avoid !important; }
  hr { margin: 0.6rem 0; }
  img { max-width: 90%; height: auto; display: block; margin: 0.4rem auto; break-inside: avoid; page-break-inside: avoid; }
`,
);

console.log('Generando PDF...');
const pdf = spawnSync('npx', ['md-to-pdf', processedMd, '--stylesheet', cssFile], {
  shell: true,
  encoding: 'utf8',
  timeout: 60000,
  stdio: 'inherit',
});

const generatedPdf = path.join(tempDir, 'DIAGRAMAS_FLUJO.pdf');
if (pdf.status === 0 && fs.existsSync(generatedPdf)) {
  fs.copyFileSync(generatedPdf, OUTPUT);
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`\nPDF generado con diagramas: ${OUTPUT}`);
} else {
  console.error('Error generando PDF. Temporales en:', tempDir);
  process.exit(1);
}
