import { beforeEach, describe, expect, test } from 'vitest'

import { ReflectMetadata } from '@public/reflect-metadata'

describe('ReflectMetadata decorator', () => {
  let reflect: ReflectMetadata

  beforeEach(() => {
    reflect = new ReflectMetadata()
  })

  test('class decorator define/get/has/delete', () => {
    @reflect.metadata('key', 'value')
    class Class { }

    expect(reflect.hasMetadata('key', Class)).toBe(true)
    expect(reflect.getMetadata('key', Class)).toBe('value')

    reflect.deleteMetadata('key', Class)
    expect(reflect.hasMetadata('key', Class)).toBe(false)
  })

  test('field decorator writes metadata to prototype via initializer', () => {
    class Field {
      @reflect.metadata('key', 'value')
      field: any
    }

    new Field()

    expect(reflect.hasMetadata('key', Field.prototype, 'field')).toBe(true)
    expect(reflect.getMetadata('key', Field.prototype, 'field')).toBe('value')
  })

  test('property (getter/setter/accessor) decorator writes metadata to prototype via initializer', () => {
    class Field {
      @reflect.metadata('key', 'value')
      accessor propAccessor = ''

      @reflect.metadata('key', 'value')
      get propGet() { return }

      @reflect.metadata('key', 'value')
      set propSet(value: any) { }
    }

    new Field()

    expect(reflect.hasMetadata('key', Field.prototype, 'propAccessor')).toBe(true)
    expect(reflect.getMetadata('key', Field.prototype, 'propAccessor')).toBe('value')

    expect(reflect.hasMetadata('key', Field.prototype, 'propGet')).toBe(true)
    expect(reflect.getMetadata('key', Field.prototype, 'propGet')).toBe('value')

    expect(reflect.hasMetadata('key', Field.prototype, 'propSet')).toBe(true)
    expect(reflect.getMetadata('key', Field.prototype, 'propSet')).toBe('value')
  })

  test('method decorator writes metadata to prototype via initializer', () => {
    class Method {
      @reflect.metadata('key', 'value')
      method() { }
    }

    new Method()

    expect(reflect.hasMetadata('key', Method.prototype, 'method')).toBe(true)
    expect(reflect.getMetadata('key', Method.prototype, 'method')).toBe('value')
  })

  test('static field decorator also stores metadata (initializer run on instantiation)', () => {
    class StaticMethod {
      @reflect.metadata('key', 'value')
      static field = ''
    }

    new StaticMethod()

    expect(reflect.hasMetadata('key', StaticMethod.prototype, 'field')).toBe(true)
    expect(reflect.getMetadata('key', StaticMethod.prototype, 'field')).toBe('value')
  })

  test('static method decorator also stores metadata (initializer run on instantiation)', () => {
    class StaticMethod {
      @reflect.metadata('key', 'value')
      static method() { }
    }

    new StaticMethod()

    expect(reflect.hasMetadata('key', StaticMethod.prototype, 'method')).toBe(true)
    expect(reflect.getMetadata('key', StaticMethod.prototype, 'method')).toBe('value')
  })
})
