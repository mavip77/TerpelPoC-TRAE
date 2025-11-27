const fs = require('fs');
const path = require('path');

function fmt(now = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}:${p(now.getHours())}.${p(now.getMinutes())}.${p(now.getSeconds())}`;
}
const RUN_TS = process.env.RUN_TS || fmt();

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function main() {
  const iosTech = path.join('reports', `e2e_ios_technical_${RUN_TS}.md`);
  const iosExec = path.join('reports', `e2e_ios_executive_${RUN_TS}.md`);
  const andTech = path.join('reports', `e2e_android_technical_${RUN_TS}.md`);
  const andExec = path.join('reports', `e2e_android_executive_${RUN_TS}.md`);
  const jestJson = path.join('reports', `jest_${RUN_TS}.json`);

  const iosAllure = path.join('reports', `allure`, `html-ios-${RUN_TS}`);
  const andAllure = path.join('reports', `allure`, `html-android-${RUN_TS}`);
  const iosShots = path.join('reports', 'screenshots', 'ios', RUN_TS);
  const andShots = path.join('reports', 'screenshots', 'android', RUN_TS);
  const iosVids = path.join('reports', 'videos', 'ios', RUN_TS);
  const andVids = path.join('reports', 'videos', 'android', RUN_TS);

  const jest = readFileSafe(jestJson);
  let jestSummary = '';
  try {
    const data = JSON.parse(jest);
    jestSummary = `Suites: ${data.numPassedTestSuites}/${data.numTotalTestSuites} OK, Tests: ${data.numPassedTests}/${data.numTotalTests} OK, Time: ${data.startTime ? new Date(data.startTime).toLocaleString() : 'N/D'}`;
  } catch {
    jestSummary = 'N/D';
  }

  const lines = [];
  lines.push(`# Reporte_de_pruebas_${RUN_TS}`);
  lines.push('');
  lines.push('## Resumen Ejecutivo');
  lines.push(`- Unitarias: ${jestSummary}`);
  lines.push(`- E2E iOS: ver ${iosExec}`);
  lines.push(`- E2E Android: ver ${andExec}`);
  lines.push('');
  lines.push('## Detalle Técnico');
  lines.push(`- iOS: ${iosTech}`);
  lines.push(`- Android: ${andTech}`);
  lines.push('');
  lines.push('## Allure');
  lines.push(`- iOS HTML: ${iosAllure}`);
  lines.push(`- Android HTML: ${andAllure}`);
  lines.push('');
  lines.push('## Evidencias');
  lines.push(`- Capturas iOS: ${iosShots}`);
  lines.push(`- Videos iOS: ${iosVids}`);
  lines.push(`- Capturas Android: ${andShots}`);
  lines.push(`- Videos Android: ${andVids}`);
  lines.push('');
  lines.push('## Funcionalidades Cubiertas');
  lines.push('- Mi Bolsillo: Favoritos (CRUD, transferir)');
  lines.push('- Cashback: navegación back y redención');
  lines.push('');
  const out = path.join('reports', `Reporte_de_pruebas_${RUN_TS}.md`);
  fs.mkdirSync('reports', {recursive: true});
  fs.writeFileSync(out, lines.join('\n'));
  process.stdout.write(`Generated: ${out}\n`);
}

main();
