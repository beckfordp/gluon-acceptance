import { describe, expect, it } from 'vitest';
import { buildMatrix, parseFeature, parseStoryTasks, renderMatrix, type StoryTask } from '../../src/coverage';

const STORIES = `# User stories

## US-1 — Browse catalog
### Tasks
- [x] US-1.1: browse/list catalog endpoints (catalog-service)
- [x] US-1.2: Redis read-through cache (catalog-service) — done 2026-10-20 (\`cache_20261020\`)
- [x] US-6.2: avoid double-charging (payment-service) — **superseded and done 2026-10-27**: retired
- [x] US-14.4: checkout orchestration — create method → \`POST /orders\` (gshop) — done 2026-10-27
- not a task line
  - [x] US-9.9: indented, so not a task

## US-20 — Authorization expiry
- [ ] US-20.1: background sweep (payment-service) — mechanism TBD
`;

const FEATURE = `@US-2.1
Feature: Add to cart (US-2)
  As a customer, I can add items.

  Background:
    Given a product is in stock

  # a comment
  @US-2.2 @smoke
  Scenario: Adding a product
    When I add it

  Scenario: Untagged here, but the feature's tag applies
    When I look

  @US-2.3
  Scenario Outline: Removing <n>
    When I remove <n>

    @ignored-examples-tag
    Examples:
      | n |
      | 1 |
`;

const task = (id: string, done = true): StoryTask => ({ id, title: `title ${id}`, done });

describe('parseStoryTasks', () => {
  it('reads top-level task lines, done or not, with the status note dropped', () => {
    expect(parseStoryTasks(STORIES)).toEqual([
      { id: 'US-1.1', title: 'browse/list catalog endpoints (catalog-service)', done: true },
      { id: 'US-1.2', title: 'Redis read-through cache (catalog-service)', done: true },
      { id: 'US-6.2', title: 'avoid double-charging (payment-service)', done: true },
      { id: 'US-14.4', title: 'checkout orchestration — create method → `POST /orders` (gshop)', done: true },
      { id: 'US-20.1', title: 'background sweep (payment-service) — mechanism TBD', done: false },
    ]);
  });
});

describe('parseFeature', () => {
  it('gives each scenario its own and its feature\'s US tags, ignoring other tags', () => {
    expect(parseFeature(FEATURE)).toEqual([
      { title: 'Add to cart (US-2) › Adding a product', tags: ['US-2.1', 'US-2.2'] },
      { title: 'Add to cart (US-2) › Untagged here, but the feature\'s tag applies', tags: ['US-2.1'] },
      { title: 'Add to cart (US-2) › Removing <n>', tags: ['US-2.1', 'US-2.3'] },
    ]);
  });

  it('finds no scenarios in a feature without any', () => {
    expect(parseFeature('Feature: Empty\n')).toEqual([]);
  });
});

describe('buildMatrix', () => {
  const scenarios = [
    { title: 'A › one', tags: ['US-1.1'] },
    { title: 'A › two', tags: ['US-1.1', 'US-3.1'] },
  ];

  it('marks each task covered, out of scope, missing or not built', () => {
    const { rows, problems } = buildMatrix(
      [task('US-1.1'), task('US-1.2'), task('US-3.1'), task('US-4.1'), task('US-20.1', false)],
      scenarios,
      { 'US-1.2': 'not UI-observable' },
    );
    expect(rows.map((r) => [r.task.id, r.status])).toEqual([
      ['US-1.1', { kind: 'covered', scenarios: ['A › one', 'A › two'] }],
      ['US-1.2', { kind: 'out-of-scope', reason: 'not UI-observable' }],
      ['US-3.1', { kind: 'covered', scenarios: ['A › two'] }],
      ['US-4.1', { kind: 'missing' }],
      ['US-20.1', { kind: 'not-built' }],
    ]);
    expect(problems).toEqual(['US-4.1 is done but has no scenario and isn\'t out of scope']);
  });

  it('flags tags and out-of-scope entries that don\'t fit the stories', () => {
    const { problems } = buildMatrix(
      [task('US-1.1'), task('US-20.1', false)],
      [{ title: 'A › one', tags: ['US-1.1', 'US-9.9', 'US-20.1'] }],
      { 'US-1.1': 'contradiction', 'US-7.7': 'stale' },
    );
    expect(problems).toEqual([
      'US-1.1 is out of scope but also covered by: A › one',
      'US-7.7 is listed out of scope but isn\'t in user-stories.md',
      'A › one tags US-9.9, which isn\'t in user-stories.md',
      'A › one tags US-20.1, which isn\'t built yet',
    ]);
  });
});

describe('renderMatrix', () => {
  it('renders the counts, one row per task and any problems', () => {
    const matrix = buildMatrix(
      [task('US-1.1'), task('US-1.2'), task('US-4.1'), task('US-20.1', false)],
      [{ title: 'A › one | two', tags: ['US-1.1'] }],
      { 'US-1.2': 'not UI-observable' },
    );
    const markdown = renderMatrix(matrix);
    expect(markdown).toContain('Covered: 1 · Out of scope: 1 · Missing: 1 · Not built: 1');
    expect(markdown).toContain('| US-1.1 | title US-1.1 | covered | A › one \\| two |');
    expect(markdown).toContain('| US-1.2 | title US-1.2 | out of scope | not UI-observable |');
    expect(markdown).toContain('| US-4.1 | title US-4.1 | **missing** |  |');
    expect(markdown).toContain('| US-20.1 | title US-20.1 | not built |  |');
    expect(markdown).toContain('- US-4.1 is done but has no scenario and isn\'t out of scope');
  });

  it('says so when there are no problems', () => {
    const markdown = renderMatrix(buildMatrix([task('US-1.1')], [{ title: 'A › one', tags: ['US-1.1'] }], {}));
    expect(markdown).toContain('No problems: every done task is covered or out of scope.');
  });
});
