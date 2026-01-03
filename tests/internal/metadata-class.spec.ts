import { beforeEach, describe, expect, test } from 'vitest'

import { MetadataContainer } from '@core/container'
import { ReflectMetadataErrorCode } from '@exceptions/code-errors'
import { InvalidTargetReflectMetadataException } from '@exceptions/invalid-target.exception'
import { INVALID_TARGET_LIST, VALID_TARGET_LIST } from '@tests/common/types-target-list'

describe('MetadataContainer Class', () => {
  let container: MetadataContainer

  beforeEach(() => {
    container = new MetadataContainer()
  })

  describe('Metadata creation', () => {
    test('should create metadata for a class', () => {
      class ClassWithMetadata { }

      container.defineMetadata('key', 'value', ClassWithMetadata)

      expect(container.getMetadata('key', ClassWithMetadata)).toBe('value')
      expect(container.hasMetadata('key', ClassWithMetadata)).toBe(true)
    })

    test('should overwrite the metadata value for an already-registered key', () => {
      class ClassWithOverrideMetadata { }

      container.defineMetadata('key', 'value', ClassWithOverrideMetadata)
      expect(container.getMetadata('key', ClassWithOverrideMetadata)).toBe('value')
      expect(container.hasMetadata('key', ClassWithOverrideMetadata)).toBe(true)

      container.defineMetadata('key', 'another-value', ClassWithOverrideMetadata)
      expect(container.getMetadata('key', ClassWithOverrideMetadata)).toBe('another-value')
      expect(container.hasMetadata('key', ClassWithOverrideMetadata)).toBe(true)
    })

    test('should create multiple metadata entries for different keys without conflicts', () => {
      class ClassWithMultiMetadata { }

      container.defineMetadata('key-1', 'value', ClassWithMultiMetadata)
      container.defineMetadata('key-2', 'another-value', ClassWithMultiMetadata)

      expect(container.getMetadata('key-1', ClassWithMultiMetadata)).toBe('value')
      expect(container.hasMetadata('key-1', ClassWithMultiMetadata)).toBe(true)
      expect(container.getMetadata('key-2', ClassWithMultiMetadata)).toBe('another-value')
      expect(container.hasMetadata('key-2', ClassWithMultiMetadata)).toBe(true)
    })

    test('should allow the same metadata key on different classes without conflicts', () => {
      class ClassWithMetadata { }
      class AnotherClassWithSameMetadata { }

      container.defineMetadata('same-key', 'value', ClassWithMetadata)
      container.defineMetadata('same-key', 'another-value', AnotherClassWithSameMetadata)

      expect(container.getMetadata('same-key', ClassWithMetadata)).toBe('value')
      expect(container.hasMetadata('same-key', ClassWithMetadata)).toBe(true)
      expect(container.getMetadata('same-key', AnotherClassWithSameMetadata)).toBe('another-value')
      expect(container.hasMetadata('same-key', AnotherClassWithSameMetadata)).toBe(true)
    })

    test('should retrieve metadata defined on a parent class from a subclass', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithSharedMetadata extends ClassFatherWithMetadata { }

      container.defineMetadata('key', 'value', ClassFatherWithMetadata)

      expect(container.getMetadata('key', ClassChildWithSharedMetadata)).toBe('value')
      expect(container.hasMetadata('key', ClassChildWithSharedMetadata)).toBe(true)
    })

    test('should retrieve metadata defined on an ancestor class across deep inheritance', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithSharedMetadataLevel1 extends ClassFatherWithMetadata { }
      class ClassChildWithSharedMetadataLevel2 extends ClassChildWithSharedMetadataLevel1 { }
      class ClassChildWithSharedMetadataLevel3 extends ClassChildWithSharedMetadataLevel2 { }
      class ClassChildWithSharedMetadataLevel4 extends ClassChildWithSharedMetadataLevel3 { }

      container.defineMetadata('key', 'value', ClassFatherWithMetadata)

      expect(container.getMetadata('key', ClassChildWithSharedMetadataLevel4)).toBe('value')
      expect(container.hasMetadata('key', ClassChildWithSharedMetadataLevel4)).toBe(true)
    })

    test('should allow a subclass to override parent metadata without affecting the parent', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithMetadataSeparated extends ClassFatherWithMetadata { }

      container.defineMetadata('key', 'value', ClassFatherWithMetadata)
      container.defineMetadata('key', 'another-value', ClassChildWithMetadataSeparated)

      expect(container.getMetadata('key', ClassFatherWithMetadata)).toBe('value')
      expect(container.getMetadata('key', ClassChildWithMetadataSeparated)).toBe('another-value')
    })

    test('should create metadata using a class instance as the target', () => {
      class Class { }

      const instance = new Class()

      container.defineMetadata('key', 'value', instance)

      expect(container.getMetadata('key', instance)).toBe('value')
      expect(container.hasMetadata('key', instance)).toBe(true)
    })

    test('should retrieve metadata defined on an instance when querying by the class', () => {
      class Class { }

      const instance = new Class()

      container.defineMetadata('key', 'value', instance)

      expect(container.getMetadata('key', Class)).toBe('value')
      expect(container.hasMetadata('key', Class)).toBe(true)
    })
  })

  describe('Metadata removal', () => {
    test('should delete metadata defined on a class', () => {
      class ClassWithMetadataToDelete { }

      container.defineMetadata('key-to-delete', 'value', ClassWithMetadataToDelete)
      expect(container.hasMetadata('key-to-delete', ClassWithMetadataToDelete)).toBe(true)

      container.deleteMetadata('key-to-delete', ClassWithMetadataToDelete)
      expect(container.hasMetadata('key-to-delete', ClassWithMetadataToDelete)).toBe(false)
    })

    test('should not affect other classes when deleting a non-existent metadata on a class', () => {
      class ClassWithMetadataToDelete { }
      class ClassWithoutMetadata { }

      container.defineMetadata('key', 'value', ClassWithMetadataToDelete)

      container.deleteMetadata('key', ClassWithoutMetadata)
      expect(container.hasMetadata('key', ClassWithMetadataToDelete)).toBe(true)
    })

    test('should delete only the specified metadata when multiple metadata entries exist on a class', () => {
      class ClassWithMultiMetadataAndDeleteOneOfThem { }

      container.defineMetadata('key', 'value', ClassWithMultiMetadataAndDeleteOneOfThem)
      container.defineMetadata('key-to-delete', 'deleted', ClassWithMultiMetadataAndDeleteOneOfThem)

      expect(container.hasMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem)).toBe(true)

      container.deleteMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem)

      expect(container.hasMetadata('key', ClassWithMultiMetadataAndDeleteOneOfThem)).toBe(true)
      expect(container.hasMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem)).toBe(false)
    })

    test('should delete only the metadata on the target class when the same key exists on other classes', () => {
      class ClassMetadata { }
      class ClassWithMetadataToDelete { }

      container.defineMetadata('same-key', 'value', ClassMetadata)
      container.defineMetadata('same-key', 'deleted', ClassWithMetadataToDelete)

      expect(container.hasMetadata('same-key', ClassWithMetadataToDelete)).toBe(true)

      container.deleteMetadata('same-key', ClassWithMetadataToDelete)

      expect(container.hasMetadata('same-key', ClassMetadata)).toBe(true)
      expect(container.hasMetadata('same-key', ClassWithMetadataToDelete)).toBe(false)
    })

    test('should delete only the subclass metadata when the same key exists in the inheritance chain', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithMetadataSeparatedToDelete extends ClassFatherWithMetadata { }

      container.defineMetadata('key', 'value', ClassFatherWithMetadata)
      container.defineMetadata('key', 'deleted', ClassChildWithMetadataSeparatedToDelete)

      expect(container.getMetadata('key', ClassFatherWithMetadata)).toBe('value')
      expect(container.getMetadata('key', ClassChildWithMetadataSeparatedToDelete)).toBe('deleted')

      container.deleteMetadata('key', ClassChildWithMetadataSeparatedToDelete)

      expect(container.getMetadata('key', ClassFatherWithMetadata)).toBe('value')
      expect(container.getMetadata('key', ClassChildWithMetadataSeparatedToDelete)).toBe('value')
    })
  })

  describe('Metadata not found', () => {
    test('should not find metadata for a class that has no metadata', () => {
      class ClassWithoutMetadata { }

      expect(container.hasMetadata('missing-key', ClassWithoutMetadata)).toBe(false)
    })

    test('should not find metadata for an unregistered key on a class that has metadata', () => {
      class ClassWithMetadata { }

      container.defineMetadata('key', 'value', ClassWithMetadata)

      expect(container.hasMetadata('missing-key', ClassWithMetadata)).toBe(false)
    })

    test('should not find metadata on a class without metadata and not confuse it with another class that has metadata', () => {
      class ClassWithoutMetadata { }
      class ClassWithMetadata { }

      container.defineMetadata('key-conflict', 'value', ClassWithMetadata)

      expect(container.hasMetadata('key-conflict', ClassWithMetadata)).toBe(true)
      expect(container.hasMetadata('key-conflict', ClassWithoutMetadata)).toBe(false)
    })
  })

  describe('Targets with varied types', () => {
    test('should throw an exception when attempting to register metadata with an invalid target', () => {
      INVALID_TARGET_LIST.forEach(value => {
        expect(() => {
          try {
            container.defineMetadata('key', 'value', value)
          } catch (error: any) {
            expect(error.code).toBe(ReflectMetadataErrorCode.TARGET_METADATA_INVALID)
            throw error
          }
        }, `expected "${String(value)}" (${typeof value}) to throw an error`)
          .toThrow(InvalidTargetReflectMetadataException)
      })
    })

    test('should not throw an exception when registering metadata with a valid target', () => {
      VALID_TARGET_LIST.forEach(value => {
        expect(() => {
          container.defineMetadata('key', 'value', value)
        }, `expected "${String(value)}" (${typeof value}) not to throw an error`)
          .not.toThrow(InvalidTargetReflectMetadataException)
      })
    })
  })
})
