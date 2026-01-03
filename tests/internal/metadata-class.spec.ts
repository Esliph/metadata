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

      container.defineClassMetadata('key', 'value', ClassWithMetadata)

      expect(container.getClassMetadata('key', ClassWithMetadata)).toBe('value')
      expect(container.hasClassMetadata('key', ClassWithMetadata)).toBe(true)
    })

    test('should overwrite the metadata value for an already-registered key', () => {
      class ClassWithOverrideMetadata { }

      container.defineClassMetadata('key', 'value', ClassWithOverrideMetadata)
      expect(container.getClassMetadata('key', ClassWithOverrideMetadata)).toBe('value')
      expect(container.hasClassMetadata('key', ClassWithOverrideMetadata)).toBe(true)

      container.defineClassMetadata('key', 'another-value', ClassWithOverrideMetadata)
      expect(container.getClassMetadata('key', ClassWithOverrideMetadata)).toBe('another-value')
      expect(container.hasClassMetadata('key', ClassWithOverrideMetadata)).toBe(true)
    })

    test('should create multiple metadata entries for different keys without conflicts', () => {
      class ClassWithMultiMetadata { }

      container.defineClassMetadata('key-1', 'value', ClassWithMultiMetadata)
      container.defineClassMetadata('key-2', 'another-value', ClassWithMultiMetadata)

      expect(container.getClassMetadata('key-1', ClassWithMultiMetadata)).toBe('value')
      expect(container.hasClassMetadata('key-1', ClassWithMultiMetadata)).toBe(true)
      expect(container.getClassMetadata('key-2', ClassWithMultiMetadata)).toBe('another-value')
      expect(container.hasClassMetadata('key-2', ClassWithMultiMetadata)).toBe(true)
    })

    test('should allow the same metadata key on different classes without conflicts', () => {
      class ClassWithMetadata { }
      class AnotherClassWithSameMetadata { }

      container.defineClassMetadata('same-key', 'value', ClassWithMetadata)
      container.defineClassMetadata('same-key', 'another-value', AnotherClassWithSameMetadata)

      expect(container.getClassMetadata('same-key', ClassWithMetadata)).toBe('value')
      expect(container.hasClassMetadata('same-key', ClassWithMetadata)).toBe(true)
      expect(container.getClassMetadata('same-key', AnotherClassWithSameMetadata)).toBe('another-value')
      expect(container.hasClassMetadata('same-key', AnotherClassWithSameMetadata)).toBe(true)
    })

    test('should retrieve metadata defined on a parent class from a subclass', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithSharedMetadata extends ClassFatherWithMetadata { }

      container.defineClassMetadata('key', 'value', ClassFatherWithMetadata)

      expect(container.getClassMetadata('key', ClassChildWithSharedMetadata)).toBe('value')
      expect(container.hasClassMetadata('key', ClassChildWithSharedMetadata)).toBe(true)
    })

    test('should retrieve metadata defined on an ancestor class across deep inheritance', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithSharedMetadataLevel1 extends ClassFatherWithMetadata { }
      class ClassChildWithSharedMetadataLevel2 extends ClassChildWithSharedMetadataLevel1 { }
      class ClassChildWithSharedMetadataLevel3 extends ClassChildWithSharedMetadataLevel2 { }
      class ClassChildWithSharedMetadataLevel4 extends ClassChildWithSharedMetadataLevel3 { }

      container.defineClassMetadata('key', 'value', ClassFatherWithMetadata)

      expect(container.getClassMetadata('key', ClassChildWithSharedMetadataLevel4)).toBe('value')
      expect(container.hasClassMetadata('key', ClassChildWithSharedMetadataLevel4)).toBe(true)
    })

    test('should allow a subclass to override parent metadata without affecting the parent', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithMetadataSeparated extends ClassFatherWithMetadata { }

      container.defineClassMetadata('key', 'value', ClassFatherWithMetadata)
      container.defineClassMetadata('key', 'another-value', ClassChildWithMetadataSeparated)

      expect(container.getClassMetadata('key', ClassFatherWithMetadata)).toBe('value')
      expect(container.getClassMetadata('key', ClassChildWithMetadataSeparated)).toBe('another-value')
    })

    test('should create metadata using a class instance as the target', () => {
      class Class { }

      const instance = new Class()

      container.defineClassMetadata('key', 'value', instance)

      expect(container.getClassMetadata('key', instance)).toBe('value')
      expect(container.hasClassMetadata('key', instance)).toBe(true)
    })

    test('should retrieve metadata defined on an instance when querying by the class', () => {
      class Class { }

      const instance = new Class()

      container.defineClassMetadata('key', 'value', instance)

      expect(container.getClassMetadata('key', Class)).toBe('value')
      expect(container.hasClassMetadata('key', Class)).toBe(true)
    })
  })

  describe('Metadata removal', () => {
    test('should delete metadata defined on a class', () => {
      class ClassWithMetadataToDelete { }

      container.defineClassMetadata('key-to-delete', 'value', ClassWithMetadataToDelete)
      expect(container.hasClassMetadata('key-to-delete', ClassWithMetadataToDelete)).toBe(true)

      container.deleteClassMetadata('key-to-delete', ClassWithMetadataToDelete)
      expect(container.hasClassMetadata('key-to-delete', ClassWithMetadataToDelete)).toBe(false)
    })

    test('should not affect other classes when deleting a non-existent metadata on a class', () => {
      class ClassWithMetadataToDelete { }
      class ClassWithoutMetadata { }

      container.defineClassMetadata('key', 'value', ClassWithMetadataToDelete)

      container.deleteClassMetadata('key', ClassWithoutMetadata)
      expect(container.hasClassMetadata('key', ClassWithMetadataToDelete)).toBe(true)
    })

    test('should delete only the specified metadata when multiple metadata entries exist on a class', () => {
      class ClassWithMultiMetadataAndDeleteOneOfThem { }

      container.defineClassMetadata('key', 'value', ClassWithMultiMetadataAndDeleteOneOfThem)
      container.defineClassMetadata('key-to-delete', 'deleted', ClassWithMultiMetadataAndDeleteOneOfThem)

      expect(container.hasClassMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem)).toBe(true)

      container.deleteClassMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem)

      expect(container.hasClassMetadata('key', ClassWithMultiMetadataAndDeleteOneOfThem)).toBe(true)
      expect(container.hasClassMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem)).toBe(false)
    })

    test('should delete only the metadata on the target class when the same key exists on other classes', () => {
      class ClassMetadata { }
      class ClassWithMetadataToDelete { }

      container.defineClassMetadata('same-key', 'value', ClassMetadata)
      container.defineClassMetadata('same-key', 'deleted', ClassWithMetadataToDelete)

      expect(container.hasClassMetadata('same-key', ClassWithMetadataToDelete)).toBe(true)

      container.deleteClassMetadata('same-key', ClassWithMetadataToDelete)

      expect(container.hasClassMetadata('same-key', ClassMetadata)).toBe(true)
      expect(container.hasClassMetadata('same-key', ClassWithMetadataToDelete)).toBe(false)
    })

    test('should delete only the subclass metadata when the same key exists in the inheritance chain', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithMetadataSeparatedToDelete extends ClassFatherWithMetadata { }

      container.defineClassMetadata('key', 'value', ClassFatherWithMetadata)
      container.defineClassMetadata('key', 'deleted', ClassChildWithMetadataSeparatedToDelete)

      expect(container.getClassMetadata('key', ClassFatherWithMetadata)).toBe('value')
      expect(container.getClassMetadata('key', ClassChildWithMetadataSeparatedToDelete)).toBe('deleted')

      container.deleteClassMetadata('key', ClassChildWithMetadataSeparatedToDelete)

      expect(container.getClassMetadata('key', ClassFatherWithMetadata)).toBe('value')
      expect(container.getClassMetadata('key', ClassChildWithMetadataSeparatedToDelete)).toBe('value')
    })
  })

  describe('Metadata not found', () => {
    test('should not find metadata for a class that has no metadata', () => {
      class ClassWithoutMetadata { }

      expect(container.hasClassMetadata('missing-key', ClassWithoutMetadata)).toBe(false)
    })

    test('should not find metadata for an unregistered key on a class that has metadata', () => {
      class ClassWithMetadata { }

      container.defineClassMetadata('key', 'value', ClassWithMetadata)

      expect(container.hasClassMetadata('missing-key', ClassWithMetadata)).toBe(false)
    })

    test('should not find metadata on a class without metadata and not confuse it with another class that has metadata', () => {
      class ClassWithoutMetadata { }
      class ClassWithMetadata { }

      container.defineClassMetadata('key-conflict', 'value', ClassWithMetadata)

      expect(container.hasClassMetadata('key-conflict', ClassWithMetadata)).toBe(true)
      expect(container.hasClassMetadata('key-conflict', ClassWithoutMetadata)).toBe(false)
    })
  })

  describe('Targets with varied types', () => {
    test('should throw an exception when attempting to register metadata with an invalid target', () => {
      INVALID_TARGET_LIST.forEach(value => {
        expect(() => {
          try {
            container.defineClassMetadata('key', 'value', value)
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
          container.defineClassMetadata('key', 'value', value)
        }, `expected "${String(value)}" (${typeof value}) not to throw an error`)
          .not.toThrow(InvalidTargetReflectMetadataException)
      })
    })
  })
})
