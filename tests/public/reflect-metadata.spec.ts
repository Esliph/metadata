import { beforeEach, describe, expect, test } from 'vitest'

import { ReflectMetadata } from '@public/reflect-metadata'

describe('ReflectMetadata public API', () => {
  let reflect: ReflectMetadata

  beforeEach(() => {
    reflect = new ReflectMetadata()
  })

  test('class metadata: define/get/has/delete', () => {
    class ClassWithMetadata { }

    reflect.defineMetadata('key', 'value', ClassWithMetadata)
    expect(reflect.hasMetadata('key', ClassWithMetadata)).toBe(true)
    expect(reflect.getMetadata('key', ClassWithMetadata)).toBe('value')
    expect(reflect.hasOwnMetadata('key', ClassWithMetadata)).toBe(true)
    expect(reflect.getOwnMetadata('key', ClassWithMetadata)).toBe('value')

    reflect.deleteMetadata('key', ClassWithMetadata)
    expect(reflect.hasMetadata('key', ClassWithMetadata)).toBe(false)
    expect(reflect.getMetadata('key', ClassWithMetadata)).toBeUndefined()
    expect(reflect.hasOwnMetadata('key', ClassWithMetadata)).toBe(false)
    expect(reflect.getOwnMetadata('key', ClassWithMetadata)).toBeUndefined()
  })

  test('property metadata: define/get/has/delete', () => {
    class ClassWithMetadataInProperty {
      prop: any
    }

    reflect.defineMetadata('key', 'value', ClassWithMetadataInProperty.prototype, 'prop')
    expect(reflect.hasMetadata('key', ClassWithMetadataInProperty.prototype, 'prop')).toBe(true)
    expect(reflect.getMetadata('key', ClassWithMetadataInProperty.prototype, 'prop')).toBe('value')
    expect(reflect.hasOwnMetadata('key', ClassWithMetadataInProperty.prototype, 'prop')).toBe(true)
    expect(reflect.getOwnMetadata('key', ClassWithMetadataInProperty.prototype, 'prop')).toBe('value')

    reflect.deleteMetadata('key', ClassWithMetadataInProperty.prototype, 'prop')
    expect(reflect.hasMetadata('key', ClassWithMetadataInProperty.prototype, 'prop')).toBe(false)
    expect(reflect.getMetadata('key', ClassWithMetadataInProperty.prototype, 'prop')).toBeUndefined()
    expect(reflect.hasOwnMetadata('key', ClassWithMetadataInProperty.prototype, 'prop')).toBe(false)
    expect(reflect.getOwnMetadata('key', ClassWithMetadataInProperty.prototype, 'prop')).toBeUndefined()
  })

  test('method metadata: define/get/has/delete', () => {
    class ClassWithMetadataInMethod {
      method() { }
    }

    reflect.defineMetadata('key', 'value', ClassWithMetadataInMethod.prototype, 'method')
    expect(reflect.hasMetadata('key', ClassWithMetadataInMethod.prototype, 'method')).toBe(true)
    expect(reflect.getMetadata('key', ClassWithMetadataInMethod.prototype, 'method')).toBe('value')
    expect(reflect.hasOwnMetadata('key', ClassWithMetadataInMethod.prototype, 'method')).toBe(true)
    expect(reflect.getOwnMetadata('key', ClassWithMetadataInMethod.prototype, 'method')).toBe('value')

    reflect.deleteMetadata('key', ClassWithMetadataInMethod.prototype, 'method')
    expect(reflect.hasMetadata('key', ClassWithMetadataInMethod.prototype, 'method')).toBe(false)
    expect(reflect.getMetadata('key', ClassWithMetadataInMethod.prototype, 'method')).toBeUndefined()
    expect(reflect.hasOwnMetadata('key', ClassWithMetadataInMethod.prototype, 'method')).toBe(false)
    expect(reflect.getOwnMetadata('key', ClassWithMetadataInMethod.prototype, 'method')).toBeUndefined()
  })

  test('parameter metadata: define/get/has/delete', () => {
    class ClassWithMetadataInParameter {
      method(a: any, b: any) { }
    }

    reflect.defineMetadata('key', 'value', ClassWithMetadataInParameter.prototype, 'method', 0)
    reflect.defineMetadata('key', 'another-value', ClassWithMetadataInParameter.prototype, 'method', 1)

    expect(reflect.hasMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 0)).toBe(true)
    expect(reflect.getMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 0)).toBe('value')
    expect(reflect.hasOwnMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 0)).toBe(true)
    expect(reflect.getOwnMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 0)).toBe('value')
    expect(reflect.hasMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 1)).toBe(true)
    expect(reflect.getMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 1)).toBe('another-value')
    expect(reflect.hasOwnMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 1)).toBe(true)
    expect(reflect.getOwnMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 1)).toBe('another-value')

    reflect.deleteMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 0)
    expect(reflect.hasMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 0)).toBe(false)
    expect(reflect.getMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 0)).toBeUndefined()
    expect(reflect.hasOwnMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 0)).toBe(false)
    expect(reflect.getOwnMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 0)).toBeUndefined()
    expect(reflect.hasMetadata('key', ClassWithMetadataInParameter.prototype, 'method', 1)).toBe(true)
  })

  test('constructor metadata: define/get/has/delete on class', () => {
    class ClassWithMetadataInConstructor { constructor(a: any) { } }

    reflect.defineMetadata('key', 'value', ClassWithMetadataInConstructor, undefined, 0)
    expect(reflect.hasMetadata('key', ClassWithMetadataInConstructor, undefined, 0)).toBe(true)
    expect(reflect.getMetadata('key', ClassWithMetadataInConstructor, undefined, 0)).toBe('value')
    expect(reflect.hasOwnMetadata('key', ClassWithMetadataInConstructor, undefined, 0)).toBe(true)
    expect(reflect.getOwnMetadata('key', ClassWithMetadataInConstructor, undefined, 0)).toBe('value')

    reflect.deleteMetadata('key', ClassWithMetadataInConstructor, undefined, 0)
    expect(reflect.hasMetadata('key', ClassWithMetadataInConstructor, undefined, 0)).toBe(false)
    expect(reflect.getMetadata('key', ClassWithMetadataInConstructor, undefined, 0)).toBeUndefined()
    expect(reflect.hasOwnMetadata('key', ClassWithMetadataInConstructor, undefined, 0)).toBe(false)
    expect(reflect.getOwnMetadata('key', ClassWithMetadataInConstructor, undefined, 0)).toBeUndefined()
  })

  test('Symbol keys work via public API', () => {
    const symbol = Symbol('symbol')

    class ClassWithKeyAsSymbol { }

    reflect.defineMetadata(symbol, 'value', ClassWithKeyAsSymbol)

    expect(reflect.hasMetadata(symbol, ClassWithKeyAsSymbol)).toBe(true)
    expect(reflect.getMetadata(symbol, ClassWithKeyAsSymbol)).toBe('value')

    class Field {
      prop: any
    }

    reflect.defineMetadata(symbol, 'value', Field.prototype, 'prop')
    expect(reflect.getMetadata(symbol, Field.prototype, 'prop')).toBe('value')

    class Method {
      method() { }
    }

    reflect.defineMetadata(symbol, 'value', Method.prototype, 'method')
    expect(reflect.getMetadata(symbol, Method.prototype, 'method')).toBe('value')

    class Parameter {
      method(a: any) { }
    }

    reflect.defineMetadata(symbol, 'value', Parameter.prototype, 'method', 0)
    expect(reflect.getMetadata(symbol, Parameter.prototype, 'method', 0)).toBe('value')
  })
})
