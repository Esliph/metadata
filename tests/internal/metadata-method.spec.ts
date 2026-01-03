import { beforeEach, describe, expect, test } from 'vitest'

import { MetadataContainer } from '@core/container'
import { ReflectMetadataErrorCode } from '@exceptions/code-errors'
import { InvalidTargetReflectMetadataException } from '@exceptions/invalid-target.exception'
import { INVALID_TARGET_LIST, VALID_TARGET_LIST } from '@tests/common/types-target-list'

describe('MetadataContainer Method', () => {
  let container: MetadataContainer

  beforeEach(() => {
    container = new MetadataContainer()
  })

  describe('Metadata creation', () => {
    test('should create metadata for a method', () => {
      class MethodWithMetadata {
        method() { }
      }

      container.defineMetadata('key', 'value', MethodWithMetadata.prototype, 'method')

      expect(container.getMetadata('key', MethodWithMetadata.prototype, 'method')).toBe('value')
      expect(container.hasMetadata('key', MethodWithMetadata.prototype, 'method')).toBe(true)
    })

    test('should overwrite the metadata value for an already-registered key', () => {
      class MethodWithOverrideMetadata {
        method() { }
      }

      container.defineMetadata('key', 'value', MethodWithOverrideMetadata.prototype, 'method')
      expect(container.getMetadata('key', MethodWithOverrideMetadata.prototype, 'method')).toBe('value')

      container.defineMetadata('key', 'another-value', MethodWithOverrideMetadata.prototype, 'method')
      expect(container.getMetadata('key', MethodWithOverrideMetadata.prototype, 'method')).toBe('another-value')
    })

    test('should create multiple metadata entries for different keys without conflicts', () => {
      class MethodWithMultiMetadata {
        method() { }
      }

      container.defineMetadata('key', 'value', MethodWithMultiMetadata.prototype, 'method')
      container.defineMetadata('another-key', 'another-value', MethodWithMultiMetadata.prototype, 'method')

      expect(container.getMetadata('key', MethodWithMultiMetadata.prototype, 'method')).toBe('value')
      expect(container.hasMetadata('key', MethodWithMultiMetadata.prototype, 'method')).toBe(true)

      expect(container.getMetadata('another-key', MethodWithMultiMetadata.prototype, 'method')).toBe('another-value')
      expect(container.hasMetadata('another-key', MethodWithMultiMetadata.prototype, 'method')).toBe(true)
    })

    test('should allow the same metadata key in different methods of the same class without conflicts', () => {
      class MultiMethodWithMetadata {
        methodA() { }
        methodB() { }
      }

      container.defineMetadata('same-key', 'value', MultiMethodWithMetadata.prototype, 'methodA')
      container.defineMetadata('same-key', 'another-value', MultiMethodWithMetadata.prototype, 'methodB')

      expect(container.getMetadata('same-key', MultiMethodWithMetadata.prototype, 'methodA')).toBe('value')
      expect(container.hasMetadata('same-key', MultiMethodWithMetadata.prototype, 'methodA')).toBe(true)

      expect(container.getMetadata('same-key', MultiMethodWithMetadata.prototype, 'methodB')).toBe('another-value')
      expect(container.hasMetadata('same-key', MultiMethodWithMetadata.prototype, 'methodB')).toBe(true)
    })

    test('should allow the same metadata key in different methods on different classes without conflicts', () => {
      class MethodWithMetadataA {
        method() { }
      }

      class MethodWithMetadataB {
        method() { }
      }

      container.defineMetadata('same-key', 'value', MethodWithMetadataA.prototype, 'method')
      container.defineMetadata('same-key', 'another-value', MethodWithMetadataB.prototype, 'method')

      expect(container.getMetadata('same-key', MethodWithMetadataA.prototype, 'method')).toBe('value')
      expect(container.hasMetadata('same-key', MethodWithMetadataA.prototype, 'method')).toBe(true)

      expect(container.getMetadata('same-key', MethodWithMetadataB.prototype, 'method')).toBe('another-value')
      expect(container.hasMetadata('same-key', MethodWithMetadataB.prototype, 'method')).toBe(true)
    })

    test('should retrieve metadata defined on a parent class from a subclass', () => {
      class MethodFatherWithMetadata {
        method() { }
      }

      class MethodChildWithSharedMetadata extends MethodFatherWithMetadata { }

      container.defineMetadata('key', 'value', MethodFatherWithMetadata.prototype, 'method')

      expect(container.getMetadata('key', MethodChildWithSharedMetadata.prototype, 'method')).toBe('value')
      expect(container.hasMetadata('key', MethodChildWithSharedMetadata.prototype, 'method')).toBe(true)
    })

    test('should retrieve metadata defined on an ancestor class across deep inheritance', () => {
      class MethodFatherWithMetadata {
        method() { }
      }

      class MethodChildWithSharedMetadataLevel1 extends MethodFatherWithMetadata { }
      class MethodChildWithSharedMetadataLevel2 extends MethodChildWithSharedMetadataLevel1 { }
      class MethodChildWithSharedMetadataLevel3 extends MethodChildWithSharedMetadataLevel2 { }
      class MethodChildWithSharedMetadataLevel4 extends MethodChildWithSharedMetadataLevel3 { }

      container.defineMetadata('key', 'value', MethodFatherWithMetadata.prototype, 'method')

      expect(container.getMetadata('key', MethodChildWithSharedMetadataLevel4.prototype, 'method')).toBe('value')
      expect(container.hasMetadata('key', MethodChildWithSharedMetadataLevel4.prototype, 'method')).toBe(true)
    })

    test('should allow a subclass to override parent metadata without affecting the parent', () => {
      class MethodFatherWithMetadata {
        method() { }
      }

      class MethodChildWithMetadataSeparated extends MethodFatherWithMetadata { }

      container.defineMetadata('key', 'value', MethodFatherWithMetadata.prototype, 'method')
      container.defineMetadata('key', 'another-value', MethodChildWithMetadataSeparated.prototype, 'method')

      expect(container.getMetadata('key', MethodFatherWithMetadata.prototype, 'method')).toBe('value')
      expect(container.getMetadata('key', MethodChildWithMetadataSeparated.prototype, 'method')).toBe('another-value')
    })

    test('should create metadata using a class instance as the target', () => {
      class MethodClass {
        method() { }
      }

      const instance = new MethodClass()

      container.defineMetadata('key', 'value', instance, 'method')

      expect(container.getMetadata('key', instance, 'method')).toBe('value')
      expect(container.hasMetadata('key', instance, 'method')).toBe(true)
    })

    test('should not retrieve metadata defined on an instance when querying by the class', () => {
      class MethodClass {
        method() { }
      }

      const instance = new MethodClass()

      container.defineMetadata('key', 'value', instance, 'method')

      expect(container.getMetadata('key', MethodClass, 'method')).toBeUndefined()
      expect(container.hasMetadata('key', MethodClass, 'method')).toBe(false)
    })

    test('should support constructor method metadata (on class)', () => {
      class ClassWithConstructor {
        constructor() { }
      }

      container.defineMetadata('key', 'ctor-value', ClassWithConstructor, 'constructor')

      expect(container.getMetadata('key', ClassWithConstructor, 'constructor')).toBe('ctor-value')
      expect(container.hasMetadata('key', ClassWithConstructor, 'constructor')).toBe(true)
    })

    test('should allow subclass constructors to inherit constructor metadata', () => {
      class ClassFatherWithConstructor { }
      class ClassChild extends ClassFatherWithConstructor { }

      container.defineMetadata('key', 'ctor-value', ClassFatherWithConstructor, 'constructor')

      expect(container.getMetadata('key', ClassChild, 'constructor')).toBe('ctor-value')
      expect(container.hasMetadata('key', ClassChild, 'constructor')).toBe(true)
    })

    test('should allow subclass to override constructor metadata independently', () => {
      class ClassFatherWithConstructor { }
      class ClassChildWithConstructor extends ClassFatherWithConstructor { }

      container.defineMetadata('key', 'ctor-value', ClassFatherWithConstructor, 'constructor')
      container.defineMetadata('key', 'child-ctor', ClassChildWithConstructor, 'constructor')

      expect(container.getMetadata('key', ClassFatherWithConstructor, 'constructor')).toBe('ctor-value')
      expect(container.getMetadata('key', ClassChildWithConstructor, 'constructor')).toBe('child-ctor')
    })
  })

  describe('Metadata removal', () => {
    test('should delete metadata defined on a method', () => {
      class ClassWithMethodToDelete {
        method() { }
      }

      container.defineMetadata('key-to-delete', 'value', ClassWithMethodToDelete.prototype, 'method')
      expect(container.hasMetadata('key-to-delete', ClassWithMethodToDelete.prototype, 'method')).toBe(true)

      container.deleteMetadata('key-to-delete', ClassWithMethodToDelete.prototype, 'method')
      expect(container.hasMetadata('key-to-delete', ClassWithMethodToDelete.prototype, 'method')).toBe(false)
    })

    test('should delete only the specified metadata when multiple metadata entries exist on a method', () => {
      class ClassWithMultiMethodAndDeleteOneOfThem {
        method() { }
      }

      container.defineMetadata('key', 'value', ClassWithMultiMethodAndDeleteOneOfThem.prototype, 'method')
      container.defineMetadata('key-to-delete', 'deleted', ClassWithMultiMethodAndDeleteOneOfThem.prototype, 'method')

      expect(container.hasMetadata('key-to-delete', ClassWithMultiMethodAndDeleteOneOfThem.prototype, 'method')).toBe(true)

      container.deleteMetadata('key-to-delete', ClassWithMultiMethodAndDeleteOneOfThem.prototype, 'method')

      expect(container.hasMetadata('key', ClassWithMultiMethodAndDeleteOneOfThem.prototype, 'method')).toBe(true)
      expect(container.hasMetadata('key-to-delete', ClassWithMultiMethodAndDeleteOneOfThem.prototype, 'method')).toBe(false)
    })

    test('should delete only the subclass method metadata when same key exists in inheritance chain', () => {
      class ClassFatherWithMethod {
        method() { }
      }

      class ClassChildWithMethodToDelete extends ClassFatherWithMethod { }

      container.defineMetadata('key', 'value', ClassFatherWithMethod.prototype, 'method')
      container.defineMetadata('key', 'deleted', ClassChildWithMethodToDelete.prototype, 'method')

      expect(container.getMetadata('key', ClassFatherWithMethod.prototype, 'method')).toBe('value')
      expect(container.getMetadata('key', ClassChildWithMethodToDelete.prototype, 'method')).toBe('deleted')

      container.deleteMetadata('key', ClassChildWithMethodToDelete.prototype, 'method')

      expect(container.getMetadata('key', ClassFatherWithMethod.prototype, 'method')).toBe('value')
      expect(container.getMetadata('key', ClassChildWithMethodToDelete.prototype, 'method')).toBe('value')
    })

    test('should delete constructor metadata on the target class only', () => {
      class ClassA { }
      class ClassB { }

      container.defineMetadata('same-key', 'value', ClassA, 'constructor')
      container.defineMetadata('same-key', 'deleted', ClassB, 'constructor')

      expect(container.hasMetadata('same-key', ClassB, 'constructor')).toBe(true)

      container.deleteMetadata('same-key', ClassB, 'constructor')

      expect(container.hasMetadata('same-key', ClassA, 'constructor')).toBe(true)
      expect(container.hasMetadata('same-key', ClassB, 'constructor')).toBe(false)
    })
  })

  describe('Metadata not found', () => {
    test('should not find metadata for a method that has no metadata', () => {
      class ClassWithoutMethodMetadata {
        method() { }
      }

      expect(container.hasMetadata('missing-key', ClassWithoutMethodMetadata.prototype, 'method')).toBe(false)
    })

    test('should not find metadata for an unregistered key on a method that has metadata', () => {
      class ClassWithMethodMetadata {
        method() { }
      }

      container.defineMetadata('key', 'value', ClassWithMethodMetadata.prototype, 'method')

      expect(container.hasMetadata('missing-key', ClassWithMethodMetadata.prototype, 'method')).toBe(false)
    })

    test('should not find metadata on a method without metadata and not confuse it with another class that has metadata', () => {
      class ClassWithoutMethodMetadata {
        method() { }
      }

      class ClassWithMethodMetadata {
        method() { }
      }

      container.defineMetadata('key-conflict', 'value', ClassWithMethodMetadata.prototype, 'method')

      expect(container.hasMetadata('key-conflict', ClassWithMethodMetadata.prototype, 'method')).toBe(true)
      expect(container.hasMetadata('key-conflict', ClassWithoutMethodMetadata.prototype, 'method')).toBe(false)
    })
  })

  describe('Targets with varied types', () => {
    test('should throw an exception when attempting to register metadata with an invalid target', () => {
      INVALID_TARGET_LIST.forEach(value => {
        expect(() => {
          try {
            container.defineMetadata('key', 'value', value, 'method')
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
          container.defineMetadata('key', 'value', value, 'method')
        }, `expected "${String(value)}" (${typeof value}) not to throw an error`)
          .not.toThrow(InvalidTargetReflectMetadataException)
      })
    })
  })
})
