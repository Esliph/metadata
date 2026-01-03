import { beforeEach, describe, expect, test } from 'vitest'

import { MetadataContainer } from '@core/container'
import { ReflectMetadataErrorCode } from '@exceptions/code-errors'
import { InvalidTargetReflectMetadataException } from '@exceptions/invalid-target.exception'
import { INVALID_TARGET_LIST, VALID_TARGET_LIST } from '@tests/common/types-target-list'

describe('MetadataContainer Property', () => {
  let container: MetadataContainer

  beforeEach(() => {
    container = new MetadataContainer()
  })

  describe('Metadata creation', () => {
    test('should create metadata for a property', () => {
      class PropertyWithMetadata {
        prop: any
      }

      container.definePropertyMetadata('key', 'value', PropertyWithMetadata.prototype, 'prop')

      expect(container.getPropertyMetadata('key', PropertyWithMetadata.prototype, 'prop')).toBe('value')
      expect(container.hasPropertyMetadata('key', PropertyWithMetadata.prototype, 'prop')).toBe(true)
    })

    test('should overwrite the metadata value for an already-registered key', () => {
      class PropertyWithOverrideMetadata {
        prop: any
      }

      container.definePropertyMetadata('key', 'value', PropertyWithOverrideMetadata.prototype, 'prop')
      expect(container.getPropertyMetadata('key', PropertyWithOverrideMetadata.prototype, 'prop')).toBe('value')

      container.definePropertyMetadata('key', 'another-value', PropertyWithOverrideMetadata.prototype, 'prop')
      expect(container.getPropertyMetadata('key', PropertyWithOverrideMetadata.prototype, 'prop')).toBe('another-value')
    })

    test('should create multiple metadata entries for different keys without conflicts', () => {
      class PropertyWithMultiMetadata {
        prop: any
      }

      container.definePropertyMetadata('key', 'value', PropertyWithMultiMetadata.prototype, 'prop')
      container.definePropertyMetadata('another-key', 'another-value', PropertyWithMultiMetadata.prototype, 'prop')

      expect(container.getPropertyMetadata('key', PropertyWithMultiMetadata.prototype, 'prop')).toBe('value')
      expect(container.hasPropertyMetadata('key', PropertyWithMultiMetadata.prototype, 'prop')).toBe(true)

      expect(container.getPropertyMetadata('another-key', PropertyWithMultiMetadata.prototype, 'prop')).toBe('another-value')
      expect(container.hasPropertyMetadata('another-key', PropertyWithMultiMetadata.prototype, 'prop')).toBe(true)
    })

    test('should allow the same metadata key in different properties of the same class without conflicts', () => {
      class MultiPropertyWithMetadata {
        propA: any
        propB: any
      }

      container.definePropertyMetadata('same-key', 'value', MultiPropertyWithMetadata.prototype, 'propA')
      container.definePropertyMetadata('same-key', 'another-value', MultiPropertyWithMetadata.prototype, 'propB')

      expect(container.getPropertyMetadata('same-key', MultiPropertyWithMetadata.prototype, 'propA')).toBe('value')
      expect(container.hasPropertyMetadata('same-key', MultiPropertyWithMetadata.prototype, 'propA')).toBe(true)

      expect(container.getPropertyMetadata('same-key', MultiPropertyWithMetadata.prototype, 'propB')).toBe('another-value')
      expect(container.hasPropertyMetadata('same-key', MultiPropertyWithMetadata.prototype, 'propB')).toBe(true)
    })

    test('should allow the same metadata key in different properties on different classes without conflicts', () => {
      class PropertyWithMetadataA {
        prop: any
      }
      class PropertyWithMetadataB {
        prop: any
      }

      container.definePropertyMetadata('same-key', 'value', PropertyWithMetadataA.prototype, 'prop')
      container.definePropertyMetadata('same-key', 'another-value', PropertyWithMetadataB.prototype, 'prop')

      expect(container.getPropertyMetadata('same-key', PropertyWithMetadataA.prototype, 'prop')).toBe('value')
      expect(container.hasPropertyMetadata('same-key', PropertyWithMetadataA.prototype, 'prop')).toBe(true)

      expect(container.getPropertyMetadata('same-key', PropertyWithMetadataB.prototype, 'prop')).toBe('another-value')
      expect(container.hasPropertyMetadata('same-key', PropertyWithMetadataB.prototype, 'prop')).toBe(true)
    })

    test('should retrieve metadata defined on a parent class from a subclass', () => {
      class PropertyFatherWithMetadata {
        prop: any
      }
      class PropertyChildWithSharedMetadata extends PropertyFatherWithMetadata { }

      container.definePropertyMetadata('key', 'value', PropertyFatherWithMetadata.prototype, 'prop')

      expect(container.getPropertyMetadata('key', PropertyChildWithSharedMetadata.prototype, 'prop')).toBe('value')
      expect(container.hasPropertyMetadata('key', PropertyChildWithSharedMetadata.prototype, 'prop')).toBe(true)
    })

    test('should retrieve metadata defined on an ancestor class across deep inheritance', () => {
      class PropertyFatherWithMetadata { prop: any }
      class PropertyChildWithSharedMetadataLevel1 extends PropertyFatherWithMetadata { }
      class PropertyChildWithSharedMetadataLevel2 extends PropertyChildWithSharedMetadataLevel1 { }
      class PropertyChildWithSharedMetadataLevel3 extends PropertyChildWithSharedMetadataLevel2 { }
      class PropertyChildWithSharedMetadataLevel4 extends PropertyChildWithSharedMetadataLevel3 { }

      container.definePropertyMetadata('key', 'value', PropertyFatherWithMetadata.prototype, 'prop')

      expect(container.getPropertyMetadata('key', PropertyChildWithSharedMetadataLevel4.prototype, 'prop')).toBe('value')
      expect(container.hasPropertyMetadata('key', PropertyChildWithSharedMetadataLevel4.prototype, 'prop')).toBe(true)
    })

    test('should allow a subclass to override parent metadata without affecting the parent', () => {
      class PropertyFatherWithMetadata {
        prop: any
      }
      class PropertyChildWithSharedMetadata extends PropertyFatherWithMetadata { }

      container.definePropertyMetadata('key', 'value', PropertyFatherWithMetadata.prototype, 'prop')
      container.definePropertyMetadata('key', 'another-value', PropertyChildWithSharedMetadata.prototype, 'prop')

      expect(container.getPropertyMetadata('key', PropertyFatherWithMetadata.prototype, 'prop')).toBe('value')
      expect(container.getPropertyMetadata('key', PropertyChildWithSharedMetadata.prototype, 'prop')).toBe('another-value')
    })

    test('should create metadata using a class instance as the target', () => {
      class Property {
        prop: any
      }

      const instance = new Property()

      container.definePropertyMetadata('key', 'value', instance, 'prop')

      expect(container.getPropertyMetadata('key', instance, 'prop')).toBe('value')
      expect(container.hasPropertyMetadata('key', instance, 'prop')).toBe(true)
    })

    test('should not retrieve metadata defined on an instance when querying by the class', () => {
      class Property {
        prop: any
      }

      const instance = new Property()

      container.definePropertyMetadata('key', 'value', instance, 'prop')

      expect(container.getPropertyMetadata('key', Property, 'prop')).toBeUndefined()
      expect(container.hasPropertyMetadata('key', Property, 'prop')).toBe(false)
    })
  })

  describe('Metadata removal', () => {
    test('should delete metadata defined on a class', () => {
      class ClassWithMetadataInPropertyToDelete {
        prop: any
      }

      container.definePropertyMetadata('key', 'value', ClassWithMetadataInPropertyToDelete.prototype, 'prop')
      expect(container.hasPropertyMetadata('key', ClassWithMetadataInPropertyToDelete.prototype, 'prop')).toBe(true)

      container.deletePropertyMetadata('key', ClassWithMetadataInPropertyToDelete.prototype, 'prop')
      expect(container.hasPropertyMetadata('key', ClassWithMetadataInPropertyToDelete.prototype, 'prop')).toBe(false)
    })

    test('should not affect other classes when deleting a non-existent metadata on a class', () => {
      class ClassWithMetadataToDelete {
        prop: any
      }

      class ClassWithoutMetadata {
        prop: any
      }

      container.definePropertyMetadata('key', 'value', ClassWithMetadataToDelete.prototype, 'prop')

      container.deletePropertyMetadata('key', ClassWithoutMetadata.prototype, 'prop')
      expect(container.hasPropertyMetadata('key', ClassWithMetadataToDelete.prototype, 'prop')).toBe(true)
    })

    test('should delete only the specified metadata when multiple metadata entries exist on a class', () => {
      class ClassWithMultiMetadataAndDeleteOneOfThem {
        prop: any
      }

      container.definePropertyMetadata('key', 'value', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')
      container.definePropertyMetadata('key-to-delete', 'deleted', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')

      expect(container.hasPropertyMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')).toBe(true)

      container.deletePropertyMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')

      expect(container.hasPropertyMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')).toBe(false)
    })

    test('should delete only the metadata on the target class when the same key exists on other classes', () => {
      class ClassMetadata {
        prop: any
      }

      class ClassWithMetadataToDelete {
        prop: any
      }

      container.definePropertyMetadata('same-key', 'value', ClassMetadata.prototype, 'prop')
      container.definePropertyMetadata('same-key', 'deleted', ClassWithMetadataToDelete.prototype, 'prop')

      expect(container.hasPropertyMetadata('same-key', ClassWithMetadataToDelete.prototype, 'prop')).toBe(true)

      container.deletePropertyMetadata('same-key', ClassWithMetadataToDelete.prototype, 'prop')

      expect(container.hasPropertyMetadata('same-key', ClassMetadata.prototype, 'prop')).toBe(true)
      expect(container.hasPropertyMetadata('same-key', ClassWithMetadataToDelete.prototype, 'prop')).toBe(false)
    })

    test('should delete only the subclass metadata when the same key exists in the inheritance chain', () => {
      class ClassFatherWithMetadata {
        prop: any
      }

      class ClassChildWithMetadataSeparatedToDelete extends ClassFatherWithMetadata { }

      container.definePropertyMetadata('key', 'value', ClassFatherWithMetadata.prototype, 'prop')
      container.definePropertyMetadata('key', 'deleted', ClassChildWithMetadataSeparatedToDelete.prototype, 'prop')

      expect(container.getPropertyMetadata('key', ClassFatherWithMetadata.prototype, 'prop')).toBe('value')
      expect(container.getPropertyMetadata('key', ClassChildWithMetadataSeparatedToDelete.prototype, 'prop')).toBe('deleted')

      container.deletePropertyMetadata('key', ClassChildWithMetadataSeparatedToDelete.prototype, 'prop')

      expect(container.getPropertyMetadata('key', ClassFatherWithMetadata.prototype, 'prop')).toBe('value')
      expect(container.getPropertyMetadata('key', ClassChildWithMetadataSeparatedToDelete.prototype, 'prop')).toBe('value')
    })
  })

  describe('Metadata not found', () => {
    test('should not find metadata for a class that has no metadata', () => {
      class ClassWithoutMetadata {
        prop: any
      }

      expect(container.hasPropertyMetadata('missing-key', ClassWithoutMetadata.prototype, 'prop')).toBe(false)
    })

    test('should not find metadata for an unregistered key on a class that has metadata', () => {
      class ClassWithMetadata {
        prop: any
      }

      container.definePropertyMetadata('key', 'value', ClassWithMetadata.prototype, 'prop')

      expect(container.hasPropertyMetadata('missing-key', ClassWithMetadata.prototype, 'prop')).toBe(false)
    })

    test('should not find metadata on a class without metadata and not confuse it with another class that has metadata', () => {
      class ClassWithoutMetadata {
        prop: any
      }

      class ClassWithMetadata {
        prop: any
      }

      container.definePropertyMetadata('key-conflict', 'value', ClassWithMetadata.prototype, 'prop')

      expect(container.hasPropertyMetadata('key-conflict', ClassWithMetadata.prototype, 'prop')).toBe(true)
      expect(container.hasPropertyMetadata('key-conflict', ClassWithoutMetadata.prototype, 'prop')).toBe(false)
    })
  })

  describe('Targets with varied types', () => {
    test('should throw an exception when attempting to register metadata with an invalid target', () => {
      INVALID_TARGET_LIST.forEach(value => {
        expect(() => {
          try {
            container.definePropertyMetadata('key', 'value', value, 'prop')
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
          container.definePropertyMetadata('key', 'value', value, 'prop')
        }, `expected "${String(value)}" (${typeof value}) not to throw an error`)
          .not.toThrow(InvalidTargetReflectMetadataException)
      })
    })
  })
})
