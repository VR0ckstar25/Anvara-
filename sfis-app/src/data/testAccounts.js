// testAccounts.js — four TEST member accounts (founder request 2026-06-11) so the
// family search/add flow can be exercised end-to-end through the real UI without
// OAuth. Fake people, realistic shapes. When accounts go live these become seeded
// directory users; the search swaps from this list to the real user directory.
// NEVER ship enabled in production builds.

export const TEST_ACCOUNTS = [
  {
    id: 'test-maya',
    name: 'Maya Lindqvist',
    email: 'maya.test@anvara.dev',
    child: false,
    watched: [
      { id: 'peanut', severity: 'Any amount' },
      { id: 'allergen.treenut', severity: 'Any amount' },
    ],
  },
  {
    id: 'test-theo',
    name: 'Theo Lindqvist',
    email: 'theo.test@anvara.dev',
    child: true,
    watched: [
      { id: 'milk', severity: 'Some' },
      { id: 'goal.less_sugar', severity: 'Prefer less' },
    ],
  },
  {
    id: 'test-ava',
    name: 'Ava Chen',
    email: 'ava.test@anvara.dev',
    child: true,
    watched: [
      { id: 'egg', severity: 'Trace' },
    ],
  },
  {
    id: 'test-rohan',
    name: 'Rohan Patel',
    email: 'rohan.test@anvara.dev',
    child: false,
    watched: [
      { id: 'gluten', severity: 'Strict' },
      { id: 'sesame', severity: 'Some' },
    ],
  },
];

export function searchTestAccounts(query, excludeIds = []) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  return TEST_ACCOUNTS.filter((a) =>
    !excludeIds.includes(a.id) &&
    (a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)));
}
