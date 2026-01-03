import { beforeEach, describe, expect, test } from 'vitest'

import { MetadataContainer } from '@core/container'
import { INVALID_TARGET_LIST, VALID_TARGET_LIST } from '@tests/common/types-target-list'
import { isValidTarget } from '@utils/target'

describe('Invalid targets', () => {
  let container: MetadataContainer

  beforeEach(() => {
    container = new MetadataContainer()
  })

  test('should classify different data types as invalid targets', () => {
    INVALID_TARGET_LIST.forEach(value => {
      expect(isValidTarget(value), `expected "${String(value)}" (${typeof value}) to be an invalid target`)
        .toBe(false)
    })
  })

  test('should classify different data types as valid targets', () => {
    VALID_TARGET_LIST.forEach(value => {
      expect(isValidTarget(value), `expected "${String(value)}" (${typeof value}) to be a valid target`)
        .toBe(true)
    })
  })
})
