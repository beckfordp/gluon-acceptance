// Writes target/coverage-matrix.md: each gluon user-story task against the
// scenarios tagged with it (ACC-6.1). Exits 1, listing the problems, unless
// every done task is covered or out of scope.
//   npm run coverage:matrix   (GLUON_DIR defaults to ../..)
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildMatrix, parseFeature, parseStoryTasks, renderMatrix } from '../src/coverage.ts';
import { OUT_OF_SCOPE } from '../src/outOfScope.ts';

const root = path.resolve(import.meta.dirname, '..');
const storiesPath = path.join(path.resolve(root, process.env.GLUON_DIR ?? '../..'), 'docs/user-stories.md');
const featuresDir = path.join(root, 'features');
const outPath = path.join(root, 'target/coverage-matrix.md');

if (!existsSync(storiesPath)) {
  console.log(`FAIL: ${storiesPath} not found; set GLUON_DIR to the gluon checkout`);
  process.exit(1);
}

const tasks = parseStoryTasks(readFileSync(storiesPath, 'utf8'));
const scenarios = readdirSync(featuresDir)
  .filter((name) => name.endsWith('.feature'))
  .sort()
  .flatMap((name) => parseFeature(readFileSync(path.join(featuresDir, name), 'utf8')));
const matrix = buildMatrix(tasks, scenarios, OUT_OF_SCOPE);

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, renderMatrix(matrix));

const count = (kind: string) => matrix.rows.filter((r) => r.status.kind === kind).length;
console.log(`coverage matrix: ${count('covered')} covered, ${count('out-of-scope')} out of scope, `
  + `${count('missing')} missing, ${count('not-built')} not built → ${path.relative(process.cwd(), outPath)}`);
if (matrix.problems.length > 0) {
  console.log(`FAIL:\n  ${matrix.problems.join('\n  ')}`);
  process.exit(1);
}
