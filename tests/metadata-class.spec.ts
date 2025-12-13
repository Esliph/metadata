import { beforeEach, describe, expect, test } from 'vitest'

import { ReflectMetadataErrorCode } from '@exceptions/code-errors'
import { InvalidTargetReflectMetadataException } from '@exceptions/invalid-target.exception'
import { ReflectMetadata } from '@reflect-metadata'
import { INVALID_TARGET_LIST, VALID_TARGET_LIST } from '@tests/common/types-target-list'

describe('Reflect Metadata Class', () => {
  let reflect: ReflectMetadata

  beforeEach(() => {
    reflect = new ReflectMetadata()
  })

  describe('Metadata creation', () => {
    test('should create metadata for a class', () => {
      class ClassWithMetadata { }

      reflect.defineMetadata('key', 'value', ClassWithMetadata)

      expect(reflect.getMetadata('key', ClassWithMetadata)).toBe('value')
      expect(reflect.hasMetadata('key', ClassWithMetadata)).toBe(true)
    })

    test('should overwrite the metadata value for an already-registered key', () => {
      class ClassWithOverrideMetadata { }

      reflect.defineMetadata('key', 'value', ClassWithOverrideMetadata)
      expect(reflect.getMetadata('key', ClassWithOverrideMetadata)).toBe('value')
      expect(reflect.hasMetadata('key', ClassWithOverrideMetadata)).toBe(true)

      reflect.defineMetadata('key', 'another-value', ClassWithOverrideMetadata)
      expect(reflect.getMetadata('key', ClassWithOverrideMetadata)).toBe('another-value')
      expect(reflect.hasMetadata('key', ClassWithOverrideMetadata)).toBe(true)
    })

    test('should create multiple metadata entries for different keys without conflicts', () => {
      class ClassWithMultiMetadata { }

      reflect.defineMetadata('key-1', 'value', ClassWithMultiMetadata)
      reflect.defineMetadata('key-2', 'another-value', ClassWithMultiMetadata)

      expect(reflect.getMetadata('key-1', ClassWithMultiMetadata)).toBe('value')
      expect(reflect.hasMetadata('key-1', ClassWithMultiMetadata)).toBe(true)
      expect(reflect.getMetadata('key-2', ClassWithMultiMetadata)).toBe('another-value')
      expect(reflect.hasMetadata('key-2', ClassWithMultiMetadata)).toBe(true)
    })

    test('should allow the same metadata key on different classes without conflicts', () => {
      class ClassWithMetadata { }
      class AnotherClassWithSameMetadata { }

      reflect.defineMetadata('same-key', 'value', ClassWithMetadata)
      reflect.defineMetadata('same-key', 'another-value', AnotherClassWithSameMetadata)

      expect(reflect.getMetadata('same-key', ClassWithMetadata)).toBe('value')
      expect(reflect.hasMetadata('same-key', ClassWithMetadata)).toBe(true)
      expect(reflect.getMetadata('same-key', AnotherClassWithSameMetadata)).toBe('another-value')
      expect(reflect.hasMetadata('same-key', AnotherClassWithSameMetadata)).toBe(true)
    })

    test('should retrieve metadata defined on a parent class from a subclass', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithSharedMetadata extends ClassFatherWithMetadata { }

      reflect.defineMetadata('key', 'value', ClassFatherWithMetadata)

      expect(reflect.getMetadata('key', ClassChildWithSharedMetadata)).toBe('value')
      expect(reflect.hasMetadata('key', ClassChildWithSharedMetadata)).toBe(true)
    })

    test('should retrieve metadata defined on an ancestor class across deep inheritance', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithSharedMetadataLevel1 extends ClassFatherWithMetadata { }
      class ClassChildWithSharedMetadataLevel2 extends ClassChildWithSharedMetadataLevel1 { }
      class ClassChildWithSharedMetadataLevel3 extends ClassChildWithSharedMetadataLevel2 { }
      class ClassChildWithSharedMetadataLevel4 extends ClassChildWithSharedMetadataLevel3 { }

      reflect.defineMetadata('key', 'value', ClassFatherWithMetadata)

      expect(reflect.getMetadata('key', ClassChildWithSharedMetadataLevel4)).toBe('value')
      expect(reflect.hasMetadata('key', ClassChildWithSharedMetadataLevel4)).toBe(true)
    })

    test('should allow a subclass to override parent metadata without affecting the parent', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithMetadataSeparated extends ClassFatherWithMetadata { }

      reflect.defineMetadata('key', 'value', ClassFatherWithMetadata)
      reflect.defineMetadata('key', 'another-value', ClassChildWithMetadataSeparated)

      expect(reflect.getMetadata('key', ClassFatherWithMetadata)).toBe('value')
      expect(reflect.getMetadata('key', ClassChildWithMetadataSeparated)).toBe('another-value')
    })

    test('should create metadata using a class instance as the target', () => {
      class Class { }

      const instance = new Class()

      reflect.defineMetadata('key', 'value', instance)

      expect(reflect.getMetadata('key', instance)).toBe('value')
      expect(reflect.hasMetadata('key', instance)).toBe(true)
    })

    test('should retrieve metadata defined on an instance when querying by the class', () => {
      class Class { }

      const instance = new Class()

      reflect.defineMetadata('key', 'value', instance)

      expect(reflect.getMetadata('key', Class)).toBe('value')
      expect(reflect.hasMetadata('key', Class)).toBe(true)
    })
  })

  describe('Metadata removal', () => {
    test('should delete metadata defined on a class', () => {
      class ClassWithMetadataToDelete { }

      reflect.defineMetadata('key-to-delete', 'value', ClassWithMetadataToDelete)
      expect(reflect.hasMetadata('key-to-delete', ClassWithMetadataToDelete)).toBe(true)

      reflect.deleteMetadata('key-to-delete', ClassWithMetadataToDelete)
      expect(reflect.hasMetadata('key-to-delete', ClassWithMetadataToDelete)).toBe(false)
    })

    test('should not affect other classes when deleting a non-existent metadata on a class', () => {
      class ClassWithMetadataToDelete { }
      class ClassWithoutMetadata { }

      reflect.defineMetadata('key', 'value', ClassWithMetadataToDelete)

      reflect.deleteMetadata('key', ClassWithoutMetadata)
      expect(reflect.hasMetadata('key', ClassWithMetadataToDelete)).toBe(true)
    })

    test('should delete only the specified metadata when multiple metadata entries exist on a class', () => {
      class ClassWithMultiMetadataAndDeleteOneOfThem { }

      reflect.defineMetadata('key', 'value', ClassWithMultiMetadataAndDeleteOneOfThem)
      reflect.defineMetadata('key-to-delete', 'deleted', ClassWithMultiMetadataAndDeleteOneOfThem)

      expect(reflect.hasMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem)).toBe(true)

      reflect.deleteMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem)

      expect(reflect.hasMetadata('key', ClassWithMultiMetadataAndDeleteOneOfThem)).toBe(true)
      expect(reflect.hasMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem)).toBe(false)
    })

    test('should delete only the metadata on the target class when the same key exists on other classes', () => {
      class ClassMetadata { }
      class ClassWithMetadataToDelete { }

      reflect.defineMetadata('same-key', 'value', ClassMetadata)
      reflect.defineMetadata('same-key', 'deleted', ClassWithMetadataToDelete)

      expect(reflect.hasMetadata('same-key', ClassWithMetadataToDelete)).toBe(true)

      reflect.deleteMetadata('same-key', ClassWithMetadataToDelete)

      expect(reflect.hasMetadata('same-key', ClassMetadata)).toBe(true)
      expect(reflect.hasMetadata('same-key', ClassWithMetadataToDelete)).toBe(false)
    })

    test('should delete only the subclass metadata when the same key exists in the inheritance chain', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithMetadataSeparatedToDelete extends ClassFatherWithMetadata { }

      reflect.defineMetadata('key', 'value', ClassFatherWithMetadata)
      reflect.defineMetadata('key', 'deleted', ClassChildWithMetadataSeparatedToDelete)

      expect(reflect.getMetadata('key', ClassFatherWithMetadata)).toBe('value')
      expect(reflect.getMetadata('key', ClassChildWithMetadataSeparatedToDelete)).toBe('deleted')

      reflect.deleteMetadata('key', ClassChildWithMetadataSeparatedToDelete)

      expect(reflect.getMetadata('key', ClassFatherWithMetadata)).toBe('value')
      expect(reflect.getMetadata('key', ClassChildWithMetadataSeparatedToDelete)).toBe('value')
    })
  })

  describe('Metadata not found', () => {
    test('should not find metadata for a class that has no metadata', () => {
      class ClassWithoutMetadata { }

      expect(reflect.hasMetadata('missing-key', ClassWithoutMetadata)).toBe(false)
    })

    test('should not find metadata for an unregistered key on a class that has metadata', () => {
      class ClassWithMetadata { }

      reflect.defineMetadata('key', 'value', ClassWithMetadata)

      expect(reflect.hasMetadata('missing-key', ClassWithMetadata)).toBe(false)
    })

    test('should not find metadata on a class without metadata and not confuse it with another class that has metadata', () => {
      class ClassWithoutMetadata { }
      class ClassWithMetadata { }

      reflect.defineMetadata('key-conflict', 'value', ClassWithMetadata)

      expect(reflect.hasMetadata('key-conflict', ClassWithMetadata)).toBe(true)
      expect(reflect.hasMetadata('key-conflict', ClassWithoutMetadata)).toBe(false)
    })
  })

  describe('Targets with varied types', () => {
    test('should throw an exception when attempting to register metadata with an invalid target', () => {
      INVALID_TARGET_LIST.forEach(value => {
        expect(() => {
          try {
            reflect.defineMetadata('key', 'value', value)
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
          reflect.defineMetadata('key', 'value', value)
        }, `expected "${String(value)}" (${typeof value}) not to throw an error`)
          .not.toThrow(InvalidTargetReflectMetadataException)
      })
    })
  })
})
