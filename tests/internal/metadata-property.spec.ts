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

      container.defineMetadata('key', 'value', PropertyWithMetadata.prototype, 'prop')

      expect(container.getMetadata('key', PropertyWithMetadata.prototype, 'prop')).toBe('value')
      expect(container.hasMetadata('key', PropertyWithMetadata.prototype, 'prop')).toBe(true)
    })

    test('should overwrite the metadata value for an already-registered key', () => {
      class PropertyWithOverrideMetadata {
        prop: any
      }

      container.defineMetadata('key', 'value', PropertyWithOverrideMetadata.prototype, 'prop')
      expect(container.getMetadata('key', PropertyWithOverrideMetadata.prototype, 'prop')).toBe('value')

      container.defineMetadata('key', 'another-value', PropertyWithOverrideMetadata.prototype, 'prop')
      expect(container.getMetadata('key', PropertyWithOverrideMetadata.prototype, 'prop')).toBe('another-value')
    })

    test('should create multiple metadata entries for different keys without conflicts', () => {
      class PropertyWithMultiMetadata {
        prop: any
      }

      container.defineMetadata('key', 'value', PropertyWithMultiMetadata.prototype, 'prop')
      container.defineMetadata('another-key', 'another-value', PropertyWithMultiMetadata.prototype, 'prop')

      expect(container.getMetadata('key', PropertyWithMultiMetadata.prototype, 'prop')).toBe('value')
      expect(container.hasMetadata('key', PropertyWithMultiMetadata.prototype, 'prop')).toBe(true)

      expect(container.getMetadata('another-key', PropertyWithMultiMetadata.prototype, 'prop')).toBe('another-value')
      expect(container.hasMetadata('another-key', PropertyWithMultiMetadata.prototype, 'prop')).toBe(true)
    })

    test('should allow the same metadata key in different properties of the same class without conflicts', () => {
      class MultiPropertyWithMetadata {
        propA: any
        propB: any
      }

      container.defineMetadata('same-key', 'value', MultiPropertyWithMetadata.prototype, 'propA')
      container.defineMetadata('same-key', 'another-value', MultiPropertyWithMetadata.prototype, 'propB')

      expect(container.getMetadata('same-key', MultiPropertyWithMetadata.prototype, 'propA')).toBe('value')
      expect(container.hasMetadata('same-key', MultiPropertyWithMetadata.prototype, 'propA')).toBe(true)

      expect(container.getMetadata('same-key', MultiPropertyWithMetadata.prototype, 'propB')).toBe('another-value')
      expect(container.hasMetadata('same-key', MultiPropertyWithMetadata.prototype, 'propB')).toBe(true)
    })

    test('should allow the same metadata key in different properties on different classes without conflicts', () => {
      class PropertyWithMetadataA {
        prop: any
      }
      class PropertyWithMetadataB {
        prop: any
      }

      container.defineMetadata('same-key', 'value', PropertyWithMetadataA.prototype, 'prop')
      container.defineMetadata('same-key', 'another-value', PropertyWithMetadataB.prototype, 'prop')

      expect(container.getMetadata('same-key', PropertyWithMetadataA.prototype, 'prop')).toBe('value')
      expect(container.hasMetadata('same-key', PropertyWithMetadataA.prototype, 'prop')).toBe(true)

      expect(container.getMetadata('same-key', PropertyWithMetadataB.prototype, 'prop')).toBe('another-value')
      expect(container.hasMetadata('same-key', PropertyWithMetadataB.prototype, 'prop')).toBe(true)
    })

    test('should retrieve metadata defined on a parent class from a subclass', () => {
      class PropertyFatherWithMetadata {
        prop: any
      }
      class PropertyChildWithSharedMetadata extends PropertyFatherWithMetadata { }

      container.defineMetadata('key', 'value', PropertyFatherWithMetadata.prototype, 'prop')

      expect(container.getMetadata('key', PropertyChildWithSharedMetadata.prototype, 'prop')).toBe('value')
      expect(container.hasMetadata('key', PropertyChildWithSharedMetadata.prototype, 'prop')).toBe(true)
    })

    test('should retrieve metadata defined on an ancestor class across deep inheritance', () => {
      class PropertyFatherWithMetadata { prop: any }
      class PropertyChildWithSharedMetadataLevel1 extends PropertyFatherWithMetadata { }
      class PropertyChildWithSharedMetadataLevel2 extends PropertyChildWithSharedMetadataLevel1 { }
      class PropertyChildWithSharedMetadataLevel3 extends PropertyChildWithSharedMetadataLevel2 { }
      class PropertyChildWithSharedMetadataLevel4 extends PropertyChildWithSharedMetadataLevel3 { }

      container.defineMetadata('key', 'value', PropertyFatherWithMetadata.prototype, 'prop')

      expect(container.getMetadata('key', PropertyChildWithSharedMetadataLevel4.prototype, 'prop')).toBe('value')
      expect(container.hasMetadata('key', PropertyChildWithSharedMetadataLevel4.prototype, 'prop')).toBe(true)
    })

    test('should allow a subclass to override parent metadata without affecting the parent', () => {
      class PropertyFatherWithMetadata {
        prop: any
      }
      class PropertyChildWithSharedMetadata extends PropertyFatherWithMetadata { }

      container.defineMetadata('key', 'value', PropertyFatherWithMetadata.prototype, 'prop')
      container.defineMetadata('key', 'another-value', PropertyChildWithSharedMetadata.prototype, 'prop')

      expect(container.getMetadata('key', PropertyFatherWithMetadata.prototype, 'prop')).toBe('value')
      expect(container.getMetadata('key', PropertyChildWithSharedMetadata.prototype, 'prop')).toBe('another-value')
    })

    test('should create metadata using a class instance as the target', () => {
      class Property {
        prop: any
      }

      const instance = new Property()

      container.defineMetadata('key', 'value', instance, 'prop')

      expect(container.getMetadata('key', instance, 'prop')).toBe('value')
      expect(container.hasMetadata('key', instance, 'prop')).toBe(true)
    })

    test('should not retrieve metadata defined on an instance when querying by the class', () => {
      class Property {
        prop: any
      }

      const instance = new Property()

      container.defineMetadata('key', 'value', instance, 'prop')

      expect(container.getMetadata('key', Property, 'prop')).toBeUndefined()
      expect(container.hasMetadata('key', Property, 'prop')).toBe(false)
    })
  })

  describe('Own metadata', () => {
    test('getOwnMetadata/hasOwnMetadata returns own property metadata only and not inherited', () => {
      class Parent { prop: any }
      class Child extends Parent { }

      container.defineMetadata('own-key', 'value', Parent.prototype, 'prop')

      expect(container.hasOwnMetadata('own-key', Parent.prototype, 'prop')).toBe(true)
      expect(container.getOwnMetadata('own-key', Parent.prototype, 'prop')).toBe('value')

      expect(container.hasMetadata('own-key', Child.prototype, 'prop')).toBe(true)
      expect(container.hasOwnMetadata('own-key', Child.prototype, 'prop')).toBe(false)
      expect(container.getOwnMetadata('own-key', Child.prototype, 'prop')).toBeUndefined()
    })

    test('getOwnMetadata for instance property metadata stays on instance', () => {
      class ClassWithMetadata {
        prop: any
      }

      const instance = new ClassWithMetadata()

      container.defineMetadata('own-key', 'value', instance, 'prop')

      expect(container.hasOwnMetadata('own-key', instance, 'prop')).toBe(true)
      expect(container.getOwnMetadata('own-key', instance, 'prop')).toBe('value')
      expect(container.hasOwnMetadata('own-key', ClassWithMetadata.prototype, 'prop')).toBe(false)
    })
  })

  describe('Symbol keys', () => {
    test('should support Symbol keys on properties and instances', () => {
      const symbol = Symbol('prop-symbol')

      class Field {
        field: any
      }

      container.defineMetadata(symbol, 'value', Field.prototype, 'field')

      expect(container.hasMetadata(symbol, Field.prototype, 'field')).toBe(true)
      expect(container.getMetadata(symbol, Field.prototype, 'field')).toBe('value')

      const instance = new Field()

      container.defineMetadata(symbol, 'instance-value', instance, 'field')

      expect(container.hasMetadata(symbol, instance, 'field')).toBe(true)
      expect(container.getMetadata(symbol, instance, 'field')).toBe('instance-value')
    })
  })

  describe('Metadata removal', () => {
    test('should delete metadata defined on a class', () => {
      class ClassWithMetadataInPropertyToDelete {
        prop: any
      }

      container.defineMetadata('key', 'value', ClassWithMetadataInPropertyToDelete.prototype, 'prop')
      expect(container.hasMetadata('key', ClassWithMetadataInPropertyToDelete.prototype, 'prop')).toBe(true)

      container.deleteMetadata('key', ClassWithMetadataInPropertyToDelete.prototype, 'prop')
      expect(container.hasMetadata('key', ClassWithMetadataInPropertyToDelete.prototype, 'prop')).toBe(false)
    })

    test('should not affect other classes when deleting a non-existent metadata on a class', () => {
      class ClassWithMetadataToDelete {
        prop: any
      }

      class ClassWithoutMetadata {
        prop: any
      }

      container.defineMetadata('key', 'value', ClassWithMetadataToDelete.prototype, 'prop')

      container.deleteMetadata('key', ClassWithoutMetadata.prototype, 'prop')
      expect(container.hasMetadata('key', ClassWithMetadataToDelete.prototype, 'prop')).toBe(true)
    })

    test('should delete only the specified metadata when multiple metadata entries exist on a class', () => {
      class ClassWithMultiMetadataAndDeleteOneOfThem {
        prop: any
      }

      container.defineMetadata('key', 'value', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')
      container.defineMetadata('key-to-delete', 'deleted', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')

      expect(container.hasMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')).toBe(true)

      container.deleteMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')

      expect(container.hasMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem.prototype, 'prop')).toBe(false)
    })

    test('should delete only the metadata on the target class when the same key exists on other classes', () => {
      class ClassMetadata {
        prop: any
      }

      class ClassWithMetadataToDelete {
        prop: any
      }

      container.defineMetadata('same-key', 'value', ClassMetadata.prototype, 'prop')
      container.defineMetadata('same-key', 'deleted', ClassWithMetadataToDelete.prototype, 'prop')

      expect(container.hasMetadata('same-key', ClassWithMetadataToDelete.prototype, 'prop')).toBe(true)

      container.deleteMetadata('same-key', ClassWithMetadataToDelete.prototype, 'prop')

      expect(container.hasMetadata('same-key', ClassMetadata.prototype, 'prop')).toBe(true)
      expect(container.hasMetadata('same-key', ClassWithMetadataToDelete.prototype, 'prop')).toBe(false)
    })

    test('should delete only the subclass metadata when the same key exists in the inheritance chain', () => {
      class ClassFatherWithMetadata {
        prop: any
      }

      class ClassChildWithMetadataSeparatedToDelete extends ClassFatherWithMetadata { }

      container.defineMetadata('key', 'value', ClassFatherWithMetadata.prototype, 'prop')
      container.defineMetadata('key', 'deleted', ClassChildWithMetadataSeparatedToDelete.prototype, 'prop')

      expect(container.getMetadata('key', ClassFatherWithMetadata.prototype, 'prop')).toBe('value')
      expect(container.getMetadata('key', ClassChildWithMetadataSeparatedToDelete.prototype, 'prop')).toBe('deleted')

      container.deleteMetadata('key', ClassChildWithMetadataSeparatedToDelete.prototype, 'prop')

      expect(container.getMetadata('key', ClassFatherWithMetadata.prototype, 'prop')).toBe('value')
      expect(container.getMetadata('key', ClassChildWithMetadataSeparatedToDelete.prototype, 'prop')).toBe('value')
    })
  })

  describe('Metadata not found', () => {
    test('should not find metadata for a class that has no metadata', () => {
      class ClassWithoutMetadata {
        prop: any
      }

      expect(container.hasMetadata('missing-key', ClassWithoutMetadata.prototype, 'prop')).toBe(false)
    })

    test('should not find metadata for an unregistered key on a class that has metadata', () => {
      class ClassWithMetadata {
        prop: any
      }

      container.defineMetadata('key', 'value', ClassWithMetadata.prototype, 'prop')

      expect(container.hasMetadata('missing-key', ClassWithMetadata.prototype, 'prop')).toBe(false)
    })

    test('should not find metadata on a class without metadata and not confuse it with another class that has metadata', () => {
      class ClassWithoutMetadata {
        prop: any
      }

      class ClassWithMetadata {
        prop: any
      }

      container.defineMetadata('key-conflict', 'value', ClassWithMetadata.prototype, 'prop')

      expect(container.hasMetadata('key-conflict', ClassWithMetadata.prototype, 'prop')).toBe(true)
      expect(container.hasMetadata('key-conflict', ClassWithoutMetadata.prototype, 'prop')).toBe(false)
    })
  })

  describe('Targets with varied types', () => {
    test('should throw an exception when attempting to register metadata with an invalid target', () => {
      INVALID_TARGET_LIST.forEach(value => {
        expect(() => {
          try {
            container.defineMetadata('key', 'value', value, 'prop')
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
          container.defineMetadata('key', 'value', value, 'prop')
        }, `expected "${String(value)}" (${typeof value}) not to throw an error`)
          .not.toThrow(InvalidTargetReflectMetadataException)
      })
    })
  })
})
