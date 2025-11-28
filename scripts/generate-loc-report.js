const fs = require('fs');
const path = require('path');

function fmt(now = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}:${p(
    now.getHours(),
  )}.${p(now.getMinutes())}.${p(now.getSeconds())}`;
}

const EXCLUDE_DIRS = new Set([
  'node_modules',
  'ios/build',
  'android/app/build',
  'reports',
  'documentacion_tecnica',
  '__tests__',
  'tests',
]);

const CONFIG_EXTS = new Set([
  '.json',
  '.xml',
  '.plist',
  '.gradle',
  '.properties',
  '.yml',
  '.yaml',
]);
const CONFIG_FILES = new Set(['wdio.ios.conf.js', 'wdio.android.conf.js']);

function isExcluded(p) {
  const rel = p.replace(process.cwd() + path.sep, '');
  return Array.from(EXCLUDE_DIRS).some(d => rel.startsWith(d));
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (isExcluded(full)) continue;
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function readLines(file) {
  try {
    return fs.readFileSync(file, 'utf8').split(/\r?\n/);
  } catch {
    return [];
  }
}

function classifyFile(file) {
  const ext = path.extname(file);
  const base = path.basename(file);
  const rel = path.relative(process.cwd(), file);
  if (CONFIG_EXTS.has(ext) || CONFIG_FILES.has(base)) return 'config';
  if (rel.startsWith('android/app/src/main') && ext === '.xml') return 'config';
  if (rel.startsWith('android/app') && ext === '.gradle') return 'config';
  if (rel.startsWith('ios/TerpelPoC') && base === 'Info.plist') return 'config';
  if (rel.startsWith(path.join('src', 'styles'))) return 'ui';
  if (rel.startsWith(path.join('src', 'components'))) return 'ui';
  if (rel.startsWith(path.join('src', 'constants'))) return 'ui';
  if (rel.startsWith(path.join('src', 'screens'))) return 'ui+biz';
  if (ext === '.tsx' || ext === '.jsx') return 'ui';
  if (ext === '.ts' || ext === '.js') return 'biz';
  return 'other';
}

function isCommentOrBlank(line) {
  const l = line.trim();
  return (
    l === '' ||
    l.startsWith('//') ||
    l.startsWith('/*') ||
    l.startsWith('*') ||
    l.startsWith('--')
  );
}

function isJsx(line) {
  const l = line.trim();
  if (/^<\w|^<\//.test(l)) return true;
  if (/React\.createElement/.test(l)) return true;
  return false;
}

function isStyleLine(line) {
  const l = line.trim();
  if (/StyleSheet\.create/.test(l)) return true;
  if (
    /(color|fontSize|fontWeight|margin|padding|alignItems|justifyContent|borderRadius)\s*:/.test(
      l,
    )
  )
    return true;
  if (/styles\./.test(l)) return true;
  return false;
}

function analyzeUiBiz(lines) {
  let ui = 0,
    biz = 0,
    total = 0;
  for (const line of lines) {
    if (isCommentOrBlank(line)) continue;
    total++;
    if (isJsx(line) || isStyleLine(line)) ui++;
    else biz++;
  }
  return {ui, biz, total};
}

function main() {
  const RUN_TS = fmt();
  const files = walk(process.cwd()).filter(f => {
    const ext = path.extname(f);
    return (
      [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.json',
        '.xml',
        '.plist',
        '.gradle',
        '.properties',
        '.yml',
        '.yaml',
      ].includes(ext) || CONFIG_FILES.has(path.basename(f))
    );
  });

  let totalLoc = 0,
    uiLoc = 0,
    bizLoc = 0,
    confLoc = 0;
  const breakdown = [];

  for (const f of files) {
    const lines = readLines(f);
    const cat = classifyFile(f);
    const nonComment = lines.filter(l => !isCommentOrBlank(l)).length;
    totalLoc += nonComment;
    let rec = {
      file: path.relative(process.cwd(), f),
      category: cat,
      loc: nonComment,
      ui: 0,
      biz: 0,
    };
    if (cat === 'config') confLoc += nonComment;
    else if (cat === 'ui') (uiLoc += nonComment), (rec.ui = nonComment);
    else if (cat === 'biz') (bizLoc += nonComment), (rec.biz = nonComment);
    else if (cat === 'ui+biz') {
      const ab = analyzeUiBiz(lines);
      uiLoc += ab.ui;
      bizLoc += ab.biz;
      rec.ui = ab.ui;
      rec.biz = ab.biz;
    }
    breakdown.push(rec);
  }

  const pct = (n, d) => (d > 0 ? ((n / d) * 100).toFixed(2) : '0.00');

  const lines = [];
  lines.push(`# Informe LOC ${RUN_TS}`);
  lines.push('');
  lines.push('## Resumen');
  lines.push('');
  lines.push('| Categoría | LOC | % |');
  lines.push('|---|---:|---:|');
  lines.push(`| UI | ${uiLoc} | ${pct(uiLoc, totalLoc)} |`);
  lines.push(`| Lógica de Negocio | ${bizLoc} | ${pct(bizLoc, totalLoc)} |`);
  lines.push(`| Configuración | ${confLoc} | ${pct(confLoc, totalLoc)} |`);
  lines.push(`| Total | ${totalLoc} | 100.00 |`);
  lines.push('');
  lines.push('## Metodología');
  lines.push(
    '- Exclusiones: `node_modules`, `reports`, `documentacion_tecnica`, builds de iOS/Android, pruebas (`__tests__`, `tests`)',
  );
  lines.push('- Conteo por líneas no vacías ni comentarios');
  lines.push(
    '- `ui+biz` (pantallas) se descompone por heurística: JSX y estilos → UI; el resto → negocio',
  );
  lines.push('');
  lines.push('## Desglose por archivo (los principales)');
  lines.push('| Archivo | Categoría | LOC | UI | Negocio |');
  lines.push('|---|---|---:|---:|---:|');
  breakdown
    .filter(r =>
      /(src\/screens\/(MiBolsillo|CashbackScreen|HomeScreen)\.tsx$|src\/components\/(OtpModal|OtpInput)\.tsx$)/.test(
        r.file,
      ),
    )
    .forEach(r =>
      lines.push(
        `| ${r.file} | ${r.category} | ${r.loc} | ${r.ui} | ${r.biz} |`,
      ),
    );
  lines.push('');
  lines.push('## Observaciones y tendencias');
  lines.push(
    '- La UI concentra la mayor parte del código debido a JSX y estilos en pantallas.',
  );
  lines.push(
    '- Parte de la lógica (Cashback, Favoritos) reside en pantallas; se recomienda extraer a `src/services`/`src/utils`.',
  );

  const outDir = path.join('reports');
  fs.mkdirSync(outDir, {recursive: true});
  const outFile = path.join(outDir, `LOC_report_${RUN_TS}.md`);
  fs.writeFileSync(outFile, lines.join('\n'));
  process.stdout.write(`${outFile}\n`);
}

main();
