import { beforeEach, describe, expect, test } from 'vitest'

import { ReflectMetadataErrorCode } from '@exceptions/code-errors'
import { InvalidTargetReflectMetadataException } from '@exceptions/invalid-target.exception'
import { ReflectMetadata } from '@reflect-metadata'
import { INVALID_TARGET_LIST, VALID_TARGET_LIST } from '@tests/common/types-target-list'

describe('Reflect Metadata Property', () => {
  let reflect: ReflectMetadata

  beforeEach(() => {
    reflect = new ReflectMetadata()
  })

  describe('Metadata creation', () => {
    test('should create metadata for a property', () => {
      class PropertyWithMetadata {
        prop: any
      }

      reflect.defineMetadata('key', 'value', PropertyWithMetadata.prototype, 'prop')

      expect(reflect.getMetadata('key', PropertyWithMetadata.prototype, 'prop')).toBe('value')
      expect(reflect.hasMetadata('key', PropertyWithMetadata.prototype, 'prop')).toBe(true)
    })

    test('should overwrite the metadata value for an already-registered key', () => {
      class PropertyWithOverrideMetadata {
        prop: any
      }

      reflect.defineMetadata('key', 'value', PropertyWithOverrideMetadata.prototype, 'prop')
      expect(reflect.getMetadata('key', PropertyWithOverrideMetadata.prototype, 'prop')).toBe('value')

      reflect.defineMetadata('key', 'another-value', PropertyWithOverrideMetadata.prototype, 'prop')
      expect(reflect.getMetadata('key', PropertyWithOverrideMetadata.prototype, 'prop')).toBe('another-value')
    })

    test('should create multiple metadata entries for different keys without conflicts', () => {
      class PropertyWithMultiMetadata {
        prop: any
      }

      reflect.defineMetadata('key', 'value', PropertyWithMultiMetadata.prototype, 'prop')
      reflect.defineMetadata('another-key', 'another-value', PropertyWithMultiMetadata.prototype, 'prop')

      expect(reflect.getMetadata('key', PropertyWithMultiMetadata.prototype, 'prop')).toBe('value')
      expect(reflect.hasMetadata('key', PropertyWithMultiMetadata.prototype, 'prop')).toBe(true)

      expect(reflect.getMetadata('another-key', PropertyWithMultiMetadata.prototype, 'prop')).toBe('another-value')
      expect(reflect.hasMetadata('another-key', PropertyWithMultiMetadata.prototype, 'prop')).toBe(true)
    })

    test('should allow the same metadata key in different properties of the same class without conflicts', () => {
      class MultiPropertyWithMetadata {
        propA: any
        propB: any
      }

      reflect.defineMetadata('same-key', 'value', MultiPropertyWithMetadata.prototype, 'propA')
      reflect.defineMetadata('same-key', 'another-value', MultiPropertyWithMetadata.prototype, 'propB')

      expect(reflect.getMetadata('same-key', MultiPropertyWithMetadata.prototype, 'propA')).toBe('value')
      expect(reflect.hasMetadata('same-key', MultiPropertyWithMetadata.prototype, 'propA')).toBe(true)

      expect(reflect.getMetadata('same-key', MultiPropertyWithMetadata.prototype, 'propB')).toBe('another-value')
      expect(reflect.hasMetadata('same-key', MultiPropertyWithMetadata.prototype, 'propB')).toBe(true)
    })

    test('should allow the same metadata key in different properties on different classes without conflicts', () => {
      class PropertyWithMetadataA {
        prop: any
      }
      class PropertyWithMetadataB {
        prop: any
      }

      reflect.defineMetadata('same-key', 'value', PropertyWithMetadataA.prototype, 'prop')
      reflect.defineMetadata('same-key', 'another-value', PropertyWithMetadataB.prototype, 'prop')

      expect(reflect.getMetadata('same-key', PropertyWithMetadataA.prototype, 'prop')).toBe('value')
      expect(reflect.hasMetadata('same-key', PropertyWithMetadataA.prototype, 'prop')).toBe(true)

      expect(reflect.getMetadata('same-key', PropertyWithMetadataB.prototype, 'prop')).toBe('another-value')
      expect(reflect.hasMetadata('same-key', PropertyWithMetadataB.prototype, 'prop')).toBe(true)
    })

    test('should retrieve metadata defined on a parent class from a subclass', () => {
      class PropertyFatherWithMetadata {
        prop: any
      }
      class PropertyChildWithSharedMetadata extends PropertyFatherWithMetadata { }

      reflect.defineMetadata('key', 'value', PropertyFatherWithMetadata.prototype, 'prop')

      expect(reflect.getMetadata('key', PropertyChildWithSharedMetadata.prototype, 'prop')).toBe('value')
      expect(reflect.hasMetadata('key', PropertyChildWithSharedMetadata.prototype, 'prop')).toBe(true)
    })

    test('should retrieve metadata defined on an ancestor class across deep inheritance', () => {
      class PropertyFatherWithMetadata { prop: any }
      class PropertyChildWithSharedMetadataLevel1 extends PropertyFatherWithMetadata { }
      class PropertyChildWithSharedMetadataLevel2 extends PropertyChildWithSharedMetadataLevel1 { }
      class PropertyChildWithSharedMetadataLevel3 extends PropertyChildWithSharedMetadataLevel2 { }
      class PropertyChildWithSharedMetadataLevel4 extends PropertyChildWithSharedMetadataLevel3 { }

      reflect.defineMetadata('key', 'value', PropertyFatherWithMetadata.prototype, 'prop')

      expect(reflect.getMetadata('key', PropertyChildWithSharedMetadataLevel4.prototype, 'prop')).toBe('value')
      expect(reflect.hasMetadata('key', PropertyChildWithSharedMetadataLevel4.prototype, 'prop')).toBe(true)
    })

    test('should allow a subclass to override parent metadata without affecting the parent', () => {
      class PropertyFatherWithMetadata {
        prop: any
      }
      class PropertyChildWithSharedMetadata extends PropertyFatherWithMetadata { }

      reflect.defineMetadata('key', 'value', PropertyFatherWithMetadata.prototype, 'prop')
      reflect.defineMetadata('key', 'another-value', PropertyChildWithSharedMetadata.prototype, 'prop')

      expect(reflect.getMetadata('key', PropertyFatherWithMetadata.prototype, 'prop')).toBe('value')
      expect(reflect.getMetadata('key', PropertyChildWithSharedMetadata.prototype, 'prop')).toBe('another-value')
    })

    test('should create metadata using a class instance as the target', () => {
      class Property {
        prop: any
      }

      const instance = new Property()

      reflect.defineMetadata('key', 'value', instance, 'prop')

      expect(reflect.getMetadata('key', instance, 'prop')).toBe('value')
      expect(reflect.hasMetadata('key', instance, 'prop')).toBe(true)
    })

    test('should not retrieve metadata defined on an instance when querying by the class', () => {
      class Property {
        prop: any
      }

      const instance = new Property()

      reflect.defineMetadata('key', 'value', instance, 'prop')

      expect(reflect.getMetadata('key', Property, 'prop')).toBeUndefined()
      expect(reflect.hasMetadata('key', Property, 'prop')).toBe(false)
    })
  })

  describe('Metadata removal', () => {
    test('should delete metadata defined on a class', () => {
      class ClassWithMetadataInPropertyToDelete {
        prop: any
      }

      reflect.defineMetadata('key', 'value', ClassWithMetadataInPropertyToDelete.prototype, 'prop')
      expect(reflect.hasMetadata('key', ClassWithMetadataInPropertyToDelete.prototype, 'prop')).toBe(true)

      reflect.deleteMetadata('key', ClassWithMetadataInPropertyToDelete.prototype, 'prop')
      expect(reflect.hasMetadata('key', ClassWithMetadataInPropertyToDelete.prototype, 'prop')).toBe(false)
    })

    test('should not affect other classes when deleting a non-existent metadata on a class', () => {
      class ClassWithMetadataToDelete {
        prop: any
      }

      class ClassWithoutMetadata {
        prop: any
      }

      reflect.defineMetadata('key', 'value', ClassWithMetadataToDelete.prototype, 'prop')

      reflect.deleteMetadata('key', ClassWithoutMetadata.prototype, 'prop')
      expect(reflect.hasMetadata('key', ClassWithMetadataToDelete.prototype, 'prop')).toBe(true)
    })

    test('should delete only the specified metadata when multiple metadata entries exist on a class', () => {
      class ClassWithMultiMetadataAndDeleteOneOfThem {
        prop: any
      }

      reflect.defineMetadata('key', 'value', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')
      reflect.defineMetadata('key-to-delete', 'deleted', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')

      expect(reflect.hasMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')).toBe(true)

      reflect.deleteMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')

      expect(reflect.hasMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')).toBe(false)
    })

    test('should delete only the metadata on the target class when the same key exists on other classes', () => {
      class ClassMetadata {
        prop: any
      }

      class ClassWithMetadataToDelete {
        prop: any
      }

      reflect.defineMetadata('same-key', 'value', ClassMetadata.prototype, 'prop')
      reflect.defineMetadata('same-key', 'deleted', ClassWithMetadataToDelete.prototype, 'prop')

      expect(reflect.hasMetadata('same-key', ClassWithMetadataToDelete.prototype, 'prop')).toBe(true)

      reflect.deleteMetadata('same-key', ClassWithMetadataToDelete.prototype, 'prop')

      expect(reflect.hasMetadata('same-key', ClassMetadata.prototype, 'prop')).toBe(true)
      expect(reflect.hasMetadata('same-key', ClassWithMetadataToDelete.prototype, 'prop')).toBe(false)
    })

    test('should delete only the subclass metadata when the same key exists in the inheritance chain', () => {
      class ClassFatherWithMetadata {
        prop: any
      }

      class ClassChildWithMetadataSeparatedToDelete extends ClassFatherWithMetadata { }

      reflect.defineMetadata('key', 'value', ClassFatherWithMetadata.prototype, 'prop')
      reflect.defineMetadata('key', 'deleted', ClassChildWithMetadataSeparatedToDelete.prototype, 'prop')

      expect(reflect.getMetadata('key', ClassFatherWithMetadata.prototype, 'prop')).toBe('value')
      expect(reflect.getMetadata('key', ClassChildWithMetadataSeparatedToDelete.prototype, 'prop')).toBe('deleted')

      reflect.deleteMetadata('key', ClassChildWithMetadataSeparatedToDelete.prototype, 'prop')

      expect(reflect.getMetadata('key', ClassFatherWithMetadata.prototype, 'prop')).toBe('value')
      expect(reflect.getMetadata('key', ClassChildWithMetadataSeparatedToDelete.prototype, 'prop')).toBe('value')
    })
  })

  describe('Metadata not found', () => {
    test('should not find metadata for a class that has no metadata', () => {
      class ClassWithoutMetadata {
        prop: any
      }

      expect(reflect.hasMetadata('missing-key', ClassWithoutMetadata.prototype, 'prop')).toBe(false)
    })

    test('should not find metadata for an unregistered key on a class that has metadata', () => {
      class ClassWithMetadata {
        prop: any
      }

      reflect.defineMetadata('key', 'value', ClassWithMetadata.prototype, 'prop')

      expect(reflect.hasMetadata('missing-key', ClassWithMetadata.prototype, 'prop')).toBe(false)
    })

    test('should not find metadata on a class without metadata and not confuse it with another class that has metadata', () => {
      class ClassWithoutMetadata {
        prop: any
      }

      class ClassWithMetadata {
        prop: any
      }

      reflect.defineMetadata('key-conflict', 'value', ClassWithMetadata.prototype, 'prop')

      expect(reflect.hasMetadata('key-conflict', ClassWithMetadata.prototype, 'prop')).toBe(true)
      expect(reflect.hasMetadata('key-conflict', ClassWithoutMetadata.prototype, 'prop')).toBe(false)
    })
  })

  describe('Targets with varied types', () => {
    test('should throw an exception when attempting to register metadata with an invalid target', () => {
      INVALID_TARGET_LIST.forEach(value => {
        expect(() => {
          try {
            reflect.defineMetadata('key', 'value', value, 'prop')
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
          reflect.defineMetadata('key', 'value', value, 'prop')
        }, `expected "${String(value)}" (${typeof value}) not to throw an error`)
          .not.toThrow(InvalidTargetReflectMetadataException)
      })
    })
  })
})
