import { beforeEach, describe, expect, test } from 'vitest'

import { MetadataContainer } from '@core/container'
import { ReflectMetadataErrorCode } from '@exceptions/code-errors'
import { InvalidTargetReflectMetadataException } from '@exceptions/invalid-target.exception'
import { INVALID_TARGET_LIST, VALID_TARGET_LIST } from '@tests/common/types-target-list'

describe('MetadataContainer Parameter', () => {
  let container: MetadataContainer

  beforeEach(() => {
    container = new MetadataContainer()
  })

  describe('Metadata creation', () => {
    test('should create metadata for a parameter', () => {
      class ParameterWithMetadata {
        method(param: any) { }
      }

      container.defineMetadata('key', 'value', ParameterWithMetadata.prototype, 'method', 0)

      expect(container.getMetadata('key', ParameterWithMetadata.prototype, 'method', 0)).toBe('value')
      expect(container.hasMetadata('key', ParameterWithMetadata.prototype, 'method', 0)).toBe(true)
    })

    test('should overwrite the metadata value for an already-registered key', () => {
      class ParameterWithOverrideMetadata {
        method(param: any) { }
      }

      container.defineMetadata('key', 'value', ParameterWithOverrideMetadata.prototype, 'method', 0)
      expect(container.getMetadata('key', ParameterWithOverrideMetadata.prototype, 'method', 0)).toBe('value')

      container.defineMetadata('key', 'another-value', ParameterWithOverrideMetadata.prototype, 'method', 0)
      expect(container.getMetadata('key', ParameterWithOverrideMetadata.prototype, 'method', 0)).toBe('another-value')
    })

    test('should create multiple metadata entries for different parameter indexes without conflicts', () => {
      class ParameterWithMultiMetadata {
        method(a: any, b: any) { }
      }

      container.defineMetadata('key', 'value', ParameterWithMultiMetadata.prototype, 'method', 0)
      container.defineMetadata('key', 'another-value', ParameterWithMultiMetadata.prototype, 'method', 1)

      expect(container.getMetadata('key', ParameterWithMultiMetadata.prototype, 'method', 0)).toBe('value')
      expect(container.hasMetadata('key', ParameterWithMultiMetadata.prototype, 'method', 0)).toBe(true)

      expect(container.getMetadata('key', ParameterWithMultiMetadata.prototype, 'method', 1)).toBe('another-value')
      expect(container.hasMetadata('key', ParameterWithMultiMetadata.prototype, 'method', 1)).toBe(true)
    })

    test('should allow same parameter key in different methods/classes without conflicts', () => {
      class A { method(p: any) { } }
      class B { method(p: any) { } }

      container.defineMetadata('same-key', 'value', A.prototype, 'method', 0)
      container.defineMetadata('same-key', 'another-value', B.prototype, 'method', 0)

      expect(container.getMetadata('same-key', A.prototype, 'method', 0)).toBe('value')
      expect(container.getMetadata('same-key', B.prototype, 'method', 0)).toBe('another-value')
    })

    test('should retrieve metadata defined on a parent class parameter from a subclass', () => {
      class Parent { method(p: any) { } }
      class Child extends Parent { }

      container.defineMetadata('key', 'value', Parent.prototype, 'method', 0)

      expect(container.getMetadata('key', Child.prototype, 'method', 0)).toBe('value')
      expect(container.hasMetadata('key', Child.prototype, 'method', 0)).toBe(true)
    })

    test('should create metadata for constructor parameters on the class', () => {
      class CtorParam { constructor(a: any) { } }

      container.defineMetadata('key', 'ctor-param', CtorParam, 'constructor', 0)

      expect(container.getMetadata('key', CtorParam, 'constructor', 0)).toBe('ctor-param')
      expect(container.hasMetadata('key', CtorParam, 'constructor', 0)).toBe(true)
    })

    test('should allow subclass to inherit constructor parameter metadata', () => {
      class ParentCtor { constructor(a: any) { } }
      class ChildCtor extends ParentCtor { }

      container.defineMetadata('key', 'ctor-param', ParentCtor, 'constructor', 0)

      expect(container.getMetadata('key', ChildCtor, 'constructor', 0)).toBe('ctor-param')
      expect(container.hasMetadata('key', ChildCtor, 'constructor', 0)).toBe(true)
    })

    test('should allow subclass to override constructor parameter metadata independently', () => {
      class ParentCtor { constructor(a: any) { } }
      class ChildCtor extends ParentCtor { }

      container.defineMetadata('key', 'ctor-param', ParentCtor, 'constructor', 0)
      container.defineMetadata('key', 'child-ctor-param', ChildCtor, 'constructor', 0)

      expect(container.getMetadata('key', ParentCtor, 'constructor', 0)).toBe('ctor-param')
      expect(container.getMetadata('key', ChildCtor, 'constructor', 0)).toBe('child-ctor-param')
    })
  })

  describe('Metadata removal', () => {
    test('should delete metadata defined on a parameter', () => {
      class ClassWithParamToDelete { method(p: any) { } }

      container.defineMetadata('key-to-delete', 'value', ClassWithParamToDelete.prototype, 'method', 0)
      expect(container.hasMetadata('key-to-delete', ClassWithParamToDelete.prototype, 'method', 0)).toBe(true)

      container.deleteMetadata('key-to-delete', ClassWithParamToDelete.prototype, 'method', 0)
      expect(container.hasMetadata('key-to-delete', ClassWithParamToDelete.prototype, 'method', 0)).toBe(false)
    })

    test('should delete only specified parameter metadata when multiple exist', () => {
      class MultiParam { method(a: any, b: any) { } }

      container.defineMetadata('key', 'value', MultiParam.prototype, 'method', 0)
      container.defineMetadata('key', 'deleted', MultiParam.prototype, 'method', 1)

      expect(container.hasMetadata('key', MultiParam.prototype, 'method', 1)).toBe(true)

      container.deleteMetadata('key', MultiParam.prototype, 'method', 1)

      expect(container.hasMetadata('key', MultiParam.prototype, 'method', 0)).toBe(true)
      expect(container.hasMetadata('key', MultiParam.prototype, 'method', 1)).toBe(false)
    })

    test('should delete constructor parameter metadata on target class only', () => {
      class A { constructor(a: any) { } }
      class B { constructor(a: any) { } }

      container.defineMetadata('same-key', 'value', A, 'constructor', 0)
      container.defineMetadata('same-key', 'deleted', B, 'constructor', 0)

      expect(container.hasMetadata('same-key', B, 'constructor', 0)).toBe(true)

      container.deleteMetadata('same-key', B, 'constructor', 0)

      expect(container.hasMetadata('same-key', A, 'constructor', 0)).toBe(true)
      expect(container.hasMetadata('same-key', B, 'constructor', 0)).toBe(false)
    })
  })

  describe('Metadata not found', () => {
    test('should not find metadata for a parameter that has no metadata', () => {
      class NoParamMeta { method(p: any) { } }

      expect(container.hasMetadata('missing-key', NoParamMeta.prototype, 'method', 0)).toBe(false)
    })

    test('should not find metadata for an unregistered key on a parameter that has metadata', () => {
      class ParamMeta { method(p: any) { } }

      container.defineMetadata('key', 'value', ParamMeta.prototype, 'method', 0)

      expect(container.hasMetadata('missing-key', ParamMeta.prototype, 'method', 0)).toBe(false)
    })

    test('should not find metadata on a parameter without metadata and not confuse with another class', () => {
      class Without { method(p: any) { } }
      class With { method(p: any) { } }

      container.defineMetadata('key-conflict', 'value', With.prototype, 'method', 0)

      expect(container.hasMetadata('key-conflict', With.prototype, 'method', 0)).toBe(true)
      expect(container.hasMetadata('key-conflict', Without.prototype, 'method', 0)).toBe(false)
    })
  })

  describe('Targets with varied types', () => {
    test('should throw an exception when attempting to register metadata with an invalid target', () => {
      INVALID_TARGET_LIST.forEach(value => {
        expect(() => {
          try {
            container.defineMetadata('key', 'value', value, 'method', 0)
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
          container.defineMetadata('key', 'value', value, 'method', 0)
        }, `expected "${String(value)}" (${typeof value}) not to throw an error`)
          .not.toThrow(InvalidTargetReflectMetadataException)
      })
    })
  })
})
