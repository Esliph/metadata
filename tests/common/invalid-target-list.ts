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