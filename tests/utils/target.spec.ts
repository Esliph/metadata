import { beforeEach, describe, expect, test } from 'vitest'

import { ReflectMetadata } from '@reflect-metadata'
import { INVALID_TARGET_LIST, VALID_TARGET_LIST } from '@tests/common/types-target-list'
import { isValidTarget } from '@utils/target'

describe('Target inválidos', () => {
  let reflect: ReflectMetadata

  beforeEach(() => {
    reflect = new ReflectMetadata()
  })

  test('Esperado que diferentes tipos de dados sejam classificados como targets inválidos', () => {
    INVALID_TARGET_LIST.forEach(value => {
      expect(isValidTarget(value), `expected "${String(value)}" (${typeof value}) to be a invalid target`)
        .toBe(false)
    })
  })

  test('Esperado que diferentes tipos de dados sejam classificados como targets válidos', () => {
    VALID_TARGET_LIST.forEach(value => {
      expect(isValidTarget(value), `expected "${String(value)}" (${typeof value}) to be a valid target`)
        .toBe(true)
    })
  })
})
