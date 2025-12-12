import { test, describe, expect, beforeEach } from 'vitest'

import { ReflectMetadata } from '@reflect-metadata'
import { isValidTarget } from '@utils/target'
import { INVALID_TARGET_LIST } from '../common/invalid-target-list'

describe('Target inválidos', () => {
  let reflect: ReflectMetadata


  beforeEach(() => {
    reflect = new ReflectMetadata()
  })

  test('Esperado disparar uma exceção quando tentar registrar um metadado com um target inválido', () => {
    INVALID_TARGET_LIST.forEach(value => {
      expect(isValidTarget(value), `expected "${String(value)}" (${typeof value}) to be a invalid target`)
        .toBe(false)
    })
  })
})