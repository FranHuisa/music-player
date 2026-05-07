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
const placeholder = content.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
  blocks.push(code.trim());
  return `__MERMAID_${counter++}__`;
});

console.log(`Encontrados ${blocks.length} diagramas Mermaid. Convirtiendo...`);

const imagePaths = blocks.map((code, i) => {
  const mmdFile = path.join(tempDir, `d${i}.mmd`);
  const pngFile = path.join(tempDir, `d${i}.png`);
  fs.writeFileSync(mmdFile, code);

  const r = spawnSync(
    'npx',
    ['@mermaid-js/mermaid-cli', '-i', mmdFile, '-o', pngFile, '-b', 'white', '-t', 'default', '-w', '900'],
    { shell: true, encoding: 'utf8', timeout: 60000 }
  );

  if (r.status !== 0) {
    console.error(`  ✗ Diagrama ${i + 1} falló:`, r.stderr?.slice(0, 200));
    return null;
  }
  console.log(`  ✓ Diagrama ${i + 1} generado`);
  return pngFile;
});

let final = placeholder;
for (let i = 0; i < blocks.length; i++) {
  const img = imagePaths[i];
  const replacement = img
    ? `\n\n![Diagrama ${i + 1}](${img.replace(/\\/g, '/')})\n\n`
    : `\n\n*(Error al renderizar diagrama ${i + 1})*\n\n`;
  final = final.replace(`__MERMAID_${i}__`, replacement);
}

const processedMd = path.join(tempDir, 'DIAGRAMAS_FLUJO.md');
fs.writeFileSync(processedMd, final);

console.log('Generando PDF...');
const pdf = spawnSync('npx', ['md-to-pdf', processedMd], {
  shell: true, encoding: 'utf8', timeout: 60000, stdio: 'inherit',
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
