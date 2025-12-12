import { test, describe, expect, beforeEach } from 'vitest'

import { ReflectMetadata } from '@reflect-metadata'
import { InvalidTargetReflectMetadataException } from '@exceptions/invalid-target.exception'
import { ReflectMetadataErrorCode } from '@exceptions/code-errors'
import { INVALID_TARGET_LIST, VALID_TARGET_LIST } from './common/types-target-list'

describe('Reflect Metadata Class', () => {
  let reflect: ReflectMetadata

  beforeEach(() => {
    reflect = new ReflectMetadata()
  })

  describe('Criação do Metadata', () => {
    test('Esperado criar um metadado para a classe', () => {
      class ClassWithMetadata { }

      reflect.defineMetadata('key', 'value', ClassWithMetadata)

      expect(reflect.getMetadata('key', ClassWithMetadata)).toBe('value')
      expect(reflect.hasMetadata('key', ClassWithMetadata)).toBe(true)
    })

    test('Esperado sobrescrever o valor do metadado para a mesma chave que ja está registrada', () => {
      class ClassWithOverrideMetadata { }

      reflect.defineMetadata('key', 'value', ClassWithOverrideMetadata)
      expect(reflect.getMetadata('key', ClassWithOverrideMetadata)).toBe('value')
      expect(reflect.hasMetadata('key', ClassWithOverrideMetadata)).toBe(true)

      reflect.defineMetadata('key', 'another-value', ClassWithOverrideMetadata)
      expect(reflect.getMetadata('key', ClassWithOverrideMetadata)).toBe('another-value')
      expect(reflect.hasMetadata('key', ClassWithOverrideMetadata)).toBe(true)
    })

    test('Esperado criar vários metadados para chaves diferentes sem conflitá-los', () => {
      class ClassWithMultiMetadata { }

      reflect.defineMetadata('key-1', 'value', ClassWithMultiMetadata)
      reflect.defineMetadata('key-2', 'another-value', ClassWithMultiMetadata)

      expect(reflect.getMetadata('key-1', ClassWithMultiMetadata)).toBe('value')
      expect(reflect.hasMetadata('key-1', ClassWithMultiMetadata)).toBe(true)
      expect(reflect.getMetadata('key-2', ClassWithMultiMetadata)).toBe('another-value')
      expect(reflect.hasMetadata('key-2', ClassWithMultiMetadata)).toBe(true)
    })

    test('Esperado criar metadados com mesma chave para classes diferentes sem conflitá-los', () => {
      class ClassWithMetadata { }
      class AnotherClassWithSameMetadata { }

      reflect.defineMetadata('same-key', 'value', ClassWithMetadata)
      reflect.defineMetadata('same-key', 'another-value', AnotherClassWithSameMetadata)

      expect(reflect.getMetadata('same-key', ClassWithMetadata)).toBe('value')
      expect(reflect.hasMetadata('same-key', ClassWithMetadata)).toBe(true)
      expect(reflect.getMetadata('same-key', AnotherClassWithSameMetadata)).toBe('another-value')
      expect(reflect.hasMetadata('same-key', AnotherClassWithSameMetadata)).toBe(true)
    })

    test('Esperado retornar um metadado de uma classe que foi definida em sua classe pai', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithSharedMetadata extends ClassFatherWithMetadata { }

      reflect.defineMetadata('key', 'value', ClassFatherWithMetadata)

      expect(reflect.getMetadata('key', ClassChildWithSharedMetadata)).toBe('value')
      expect(reflect.hasMetadata('key', ClassChildWithSharedMetadata)).toBe(true)
    })

    test('Esperado retornar um metadado de uma classe que foi definida em sua classe pai com herança profunda', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithSharedMetadataLevel1 extends ClassFatherWithMetadata { }
      class ClassChildWithSharedMetadataLevel2 extends ClassChildWithSharedMetadataLevel1 { }
      class ClassChildWithSharedMetadataLevel3 extends ClassChildWithSharedMetadataLevel2 { }
      class ClassChildWithSharedMetadataLevel4 extends ClassChildWithSharedMetadataLevel3 { }

      reflect.defineMetadata('key', 'value', ClassFatherWithMetadata)

      expect(reflect.getMetadata('key', ClassChildWithSharedMetadataLevel4)).toBe('value')
      expect(reflect.hasMetadata('key', ClassChildWithSharedMetadataLevel4)).toBe(true)
    })

    test('Esperado que o metadado definido na classe pai seja sobrescrita na classe filha sem conflitar com o metadado pai', () => {
      class ClassFatherWithMetadata { }
      class ClassChildWithMetadataSeparated extends ClassFatherWithMetadata { }

      reflect.defineMetadata('key', 'value', ClassFatherWithMetadata)
      reflect.defineMetadata('key', 'another-value', ClassChildWithMetadataSeparated)

      expect(reflect.getMetadata('key', ClassFatherWithMetadata)).toBe('value')
      expect(reflect.getMetadata('key', ClassChildWithMetadataSeparated)).toBe('another-value')
    })

    test('Esperado criar um metadado a partir de uma instância de uma classe como target', () => {
      class Class { }

      const instance = new Class()

      reflect.defineMetadata('key', 'value', instance)

      expect(reflect.getMetadata('key', instance)).toBe('value')
      expect(reflect.hasMetadata('key', instance)).toBe(true)
    })

    test('Esperado encontrar o metadado registrado a partir de uma instância de uma classe como target usando a própria classe para busca-la', () => {
      class Class { }

      const instance = new Class()

      reflect.defineMetadata('key', 'value', instance)

      expect(reflect.getMetadata('key', Class)).toBe('value')
      expect(reflect.hasMetadata('key', Class)).toBe(true)
    })
  })

  describe('Remoção do Metadata', () => {
    test('Esperado deletar um metadado definido em uma classe', () => {
      class ClassWithMetadataToDelete { }

      reflect.defineMetadata('key-to-delete', 'value', ClassWithMetadataToDelete)
      expect(reflect.hasMetadata('key-to-delete', ClassWithMetadataToDelete)).toBe(true)

      reflect.deleteMetadata('key-to-delete', ClassWithMetadataToDelete)
      expect(reflect.hasMetadata('key-to-delete', ClassWithMetadataToDelete)).toBe(false)
    })

    test('Esperado que ao deletar um metadado de uma classe que não tenha metadado não conflite com metadados de outra classe', () => {
      class ClassWithMetadataToDelete { }
      class ClassWithoutMetadata { }

      reflect.defineMetadata('key', 'value', ClassWithMetadataToDelete)

      reflect.deleteMetadata('key', ClassWithoutMetadata)
      expect(reflect.hasMetadata('key', ClassWithMetadataToDelete)).toBe(true)
    })

    test('Esperado deletar apenas o metadado definido em uma classe que tenha mais de um metadado registrado', () => {
      class ClassWithMultiMetadataAndDeleteOneOfThem { }

      reflect.defineMetadata('key', 'value', ClassWithMultiMetadataAndDeleteOneOfThem)
      reflect.defineMetadata('key-to-delete', 'deleted', ClassWithMultiMetadataAndDeleteOneOfThem)

      expect(reflect.hasMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem)).toBe(true)

      reflect.deleteMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem)

      expect(reflect.hasMetadata('key', ClassWithMultiMetadataAndDeleteOneOfThem)).toBe(true)
      expect(reflect.hasMetadata('key-to-delete', ClassWithMultiMetadataAndDeleteOneOfThem)).toBe(false)
    })

    test('Esperado deletar apenas o metadado definido na classe se conflitar com os metadados definidos em outras classes', () => {
      class ClassMetadata { }
      class ClassWithMetadataToDelete { }

      reflect.defineMetadata('same-key', 'value', ClassMetadata)
      reflect.defineMetadata('same-key', 'deleted', ClassWithMetadataToDelete)

      expect(reflect.hasMetadata('same-key', ClassWithMetadataToDelete)).toBe(true)

      reflect.deleteMetadata('same-key', ClassWithMetadataToDelete)

      expect(reflect.hasMetadata('same-key', ClassMetadata)).toBe(true)
      expect(reflect.hasMetadata('same-key', ClassWithMetadataToDelete)).toBe(false)
    })

    test('Esperado deletar apenas o metadado definido na classe se conflitar com os metadados definidos em outras classes da herança', () => {
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

  describe('Metadados não encontrados', () => {
    test('Esperado não encontrar um metadado informando uma classe que não possui metadados', () => {
      class ClassWithoutMetadata { }

      expect(reflect.hasMetadata('missing-key', ClassWithoutMetadata)).toBe(false)
    })

    test('Esperado não encontrar um metadado informando uma chave que não esta registrada na classe que possui metadados', () => {
      class ClassWithMetadata { }

      reflect.defineMetadata('key', 'value', ClassWithMetadata)

      expect(reflect.hasMetadata('missing-key', ClassWithMetadata)).toBe(false)
    })

    test('Esperado não encontrar um metadado informando uma classe que não possui metadados e que não conflite com outras que possui metadados', () => {
      class ClassWithoutMetadata { }
      class ClassWithMetadata { }

      reflect.defineMetadata('key-conflit', 'value', ClassWithMetadata)

      expect(reflect.hasMetadata('key-conflit', ClassWithMetadata)).toBe(true)
      expect(reflect.hasMetadata('key-conflit', ClassWithoutMetadata)).toBe(false)
    })
  })

  describe('Target com tipos variados', () => {
    test('Esperado disparar uma exceção quando tentar registrar um metadado com um target inválido', () => {
      INVALID_TARGET_LIST.forEach(value => {
        expect(() => {
          try {
            reflect.defineMetadata('key', 'value', value)
          } catch (error: any) {
            expect(error.code).toBe(ReflectMetadataErrorCode.TARGET_METADATA_INVALID)
            throw error
          }
        }, `expected "${String(value)}" (${typeof value}) throw an erro`)
          .toThrow(InvalidTargetReflectMetadataException)
      })
    })

    test('Esperado não disparar uma exceção quando tentar registrar um metadado com um target válido', () => {
      VALID_TARGET_LIST.forEach(value => {
        expect(() => {
          reflect.defineMetadata('key', 'value', value)
        }, `expected "${String(value)}" (${typeof value}) not throw an erro`)
          .not.toThrow(InvalidTargetReflectMetadataException)
      })
    })
  })
})