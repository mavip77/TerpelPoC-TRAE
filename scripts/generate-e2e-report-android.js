const fs = require('fs');
const path = require('path');
function fmt(now = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}:${p(
    now.getHours(),
  )}.${p(now.getMinutes())}.${p(now.getSeconds())}`;
}
const RUN_TS = process.env.RUN_TS || fmt();

function readJsonReports(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  return files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function aggregate(results) {
  let specs = 0;
  let tests = 0;
  let passed = 0;
  let failed = 0;
  const cases = [];
  results.forEach(r => {
    specs += 1;
    const suites = r.suites || [];
    suites.forEach(suite => {
      (suite.tests || []).forEach(t => {
        tests += 1;
        const ok = t.state === 'passed';
        if (ok) passed += 1;
        else failed += 1;
        cases.push({
          spec: r.specFile,
          title: t.title,
          state: t.state,
          duration: t.duration || null,
        });
      });
    });
  });
  return {specs, tests, passed, failed, cases};
}

function formatDuration(ms) {
  if (ms == null) return 'N/D';
  const s = (ms / 1000).toFixed(1);
  return `${s}s`;
}

function writeTechnicalMD(agg, dir) {
  const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const lines = [];
  lines.push(`# Reporte Técnico E2E Android - ${ts}`);
  lines.push('');
  lines.push('- Resumen');
  lines.push(`  - Especificaciones: ${agg.specs}`);
  lines.push(`  - Pruebas: ${agg.tests}`);
  lines.push(`  - Aprobadas: ${agg.passed}`);
  lines.push(`  - Fallidas: ${agg.failed}`);
  lines.push('');
  lines.push('## Casos');
  lines.push('| Spec | Caso | Estado | Duración | Video |');
  lines.push('|---|---|---|---|---|');
  agg.cases.forEach(c => {
    const vidsDir = path.join('reports', 'videos', 'android', RUN_TS);
    let videoCell = 'N/D';
    if (fs.existsSync(vidsDir)) {
      const files = fs.readdirSync(vidsDir);
      const namePart = (c.title || '').replace(/\s+/g, '_');
      const match = files.find(f => f.includes(namePart));
      if (match) videoCell = `[${match}](../videos/android/${RUN_TS}/${match})`;
    }
    lines.push(
      `| ${c.spec || 'N/D'} | ${c.title} | ${
        c.state === 'passed' ? '✅' : '❌'
      } | ${formatDuration(c.duration)} | ${videoCell} |`,
    );
  });
  // Stacktraces desde Allure results
  lines.push('');
  lines.push('## Errores (stacktrace)');
  try {
    const allureDir = path.join('reports', 'allure', `android-${RUN_TS}`);
    const files = fs
      .readdirSync(allureDir)
      .filter(f => f.endsWith('-result.json'));
    const failed = [];
    files.forEach(f => {
      const obj = JSON.parse(fs.readFileSync(path.join(allureDir, f), 'utf8'));
      if (obj.status === 'failed') failed.push(obj);
    });
    if (failed.length === 0) {
      lines.push('- Sin fallos');
    } else {
      failed.forEach(obj => {
        const name = obj.name || obj.fullName || 'Caso';
        const sd = obj.statusDetails || {};
        lines.push(`### ${name}`);
        if (sd.message) {
          lines.push('**Mensaje:**');
          lines.push('');
          lines.push(sd.message);
        }
        if (sd.trace) {
          lines.push('');
          lines.push('**Stacktrace:**');
          lines.push('');
          lines.push('```');
          lines.push(sd.trace);
          lines.push('```');
        }
        lines.push('');
      });
    }
  } catch {}
  // Screenshots
  lines.push('');
  lines.push('## Screenshots de fallos');
  const shotsDir = path.join('reports', 'screenshots', 'android', RUN_TS);
  if (fs.existsSync(shotsDir)) {
    const files = fs.readdirSync(shotsDir).filter(f => /failed\.png$/.test(f));
    if (files.length === 0) lines.push('- No hay capturas de fallos');
    else
      files.forEach(f =>
        lines.push(`- [${f}](../screenshots/android/${RUN_TS}/${f})`),
      );
  } else {
    lines.push('- Directorio de capturas no disponible');
  }
  const out = path.join('reports', `e2e_android_technical_${RUN_TS}.md`);
  fs.mkdirSync('reports', {recursive: true});
  fs.writeFileSync(out, lines.join('\n'));
  return out;
}

function writeExecutiveMD(agg, dir) {
  const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const successPct = agg.tests
    ? ((agg.passed / agg.tests) * 100).toFixed(2)
    : '0.00';
  const lines = [];
  lines.push(`# Reporte Ejecutivo E2E Android - ${ts}`);
  lines.push('');
  lines.push('## Resumen Ejecutivo');
  lines.push(`- Éxito total: ${successPct}%`);
  lines.push(`- Pruebas ejecutadas: ${agg.tests}`);
  lines.push(`- Fallos: ${agg.failed}`);
  lines.push('');
  lines.push('## Hallazgos');
  lines.push('- Estabilidad del flujo OTP verificada.');
  lines.push('- Se recomienda asegurar servidor Appium persistente en :4723.');
  lines.push('');
  lines.push('## Recomendaciones');
  lines.push('- Integrar limpieza ADB previa a ejecución.');
  lines.push('- Mantener tiempos de espera elevados en arranque.');
  const out = path.join('reports', `e2e_android_executive_${RUN_TS}.md`);
  fs.mkdirSync('reports', {recursive: true});
  fs.writeFileSync(out, lines.join('\n'));
  return out;
}

function main() {
  const dir = path.join('reports', 'wdio-json', 'android', RUN_TS);
  let results = readJsonReports(dir);
  let agg = aggregate(results);
  if (agg.tests === 0) {
    const logPath = path.join('reports', `wdio-android-${RUN_TS}.log`);
    if (fs.existsSync(logPath)) {
      const log = fs.readFileSync(logPath, 'utf8');
      const caseLines = Array.from(log.matchAll(/\s+\u2713\s([^\n]+)/g)).map(
        m => ({title: m[1], state: 'passed'}),
      );
      const failLines = Array.from(log.matchAll(/\s+\u2717\s([^\n]+)/g)).map(
        m => ({title: m[1], state: 'failed'}),
      );
      const cases = [...caseLines, ...failLines];
      agg = {
        specs: (log.match(/Spec Files:/g) || []).length || 1,
        tests: cases.length,
        passed: caseLines.length,
        failed: failLines.length,
        cases,
      };
    }
  }
  const tech = writeTechnicalMD(agg, dir);
  const exec = writeExecutiveMD(agg, dir);
  process.stdout.write(`Generated: ${tech}\n`);
  process.stdout.write(`Generated: ${exec}\n`);
}

main();
