/* v8 ignore file -- @preserve */

enum RandomEnum { FOO }

export const INVALID_TARGET_LIST: any[] = [
  RandomEnum.FOO,
  null,
  undefined,

  true,
  false,
  0,
  42,
  NaN,
  Infinity,
  -Infinity,
  'string',
  '',
  Symbol('sym'),

  () => { },
  async () => { },
  function* () { },
  async function () { },
]

export const VALID_TARGET_LIST: any[] = [
  class ValidClass { },
  function Abc() { },
  new Date(),
  /abc/,
  new Map(),
  new Set(),
  new WeakMap(),
  new WeakSet(),
  [],
  Promise.resolve(),
  Object.freeze({ a: 1 }),
  Object.seal({ b: 2 }),
]
