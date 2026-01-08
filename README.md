# Metadata

**Visão Geral**

Esta documentação explica o uso da API pública `ReflectMetadata` para leitura e escrita de metadados em classes, métodos, parâmetros, atributos (fields) e propriedades (accessors). Também descreve o uso de decorators para aplicação de metadados e lista as exceções relacionadas. Sua API é inspirada na especificação de decorators do TypeScript e na API de metadados proposta para JavaScript e é um substituto para a o [reflect-metadata](https://www.npmjs.com/package/reflect-metadata).

- [Metadata](#metadata)
  - [Quick Start](#quick-start)
  - [Operações Básicas](#operações-básicas)
  - [Suporte a Symbol](#suporte-a-symbol)
  - [Uso com decorators](#uso-com-decorators)
    - [Observações sobre decorators e inicializadores:](#observações-sobre-decorators-e-inicializadores)
  - [Comportamentos importantes](#comportamentos-importantes)
  - [Container de Metadados isolados](#container-de-metadados-isolados)
  - [Exceções](#exceções)

## Quick Start

Segue um exemplo rápido de uso da API `ReflectMetadata`:

```ts
import { Reflect } from '@esliph/metadata'

@Reflect.metadata('key-dec', 'value') // decorator de metadado na classe
@Reflect.metadataParam(0, 'key-dec', 'value') // decorator de metadado no parâmetro do constructor
class MyClass {
  @Reflect.metadata('key-dec', 'value') // decorator de metadado na propriedade
  prop: any

  constructor(param: any) {}

  @Reflect.metadata('key-dec', 'value') // decorator de metadado no método
  @Reflect.metadataParam(0, 'key-dec', 'value') // decorator de metadado no parâmetro do método
  method(param: any) {}
}

Reflect.defineMetadata('key', 'value', MyClass) // metadata na classe
Reflect.defineMetadata('key', 'value', MyClass.prototype, 'prop') // metadata na propriedade
Reflect.defineMetadata('key', 'value', MyClass.prototype, 'method') // metadata no método
Reflect.defineMetadata('key', 'value', MyClass.prototype, undefined, 0) // metadata no parâmetro do construtor
Reflect.defineMetadata('key', 'value', MyClass.prototype, 'method', 0) // metadata no parâmetro do método
```

## Operações Básicas

- **Definir metadado**: `reflect.defineMetadata(key, value, target, propertyKey?, parameterIndex?)`
- **Ler metadado**: `reflect.getMetadata(key, target, propertyKey?, parameterIndex?)`
- **Ler próprio**: `reflect.getOwnMetadata(key, target, propertyKey?, parameterIndex?)`
- **Verificar (inclui protótipo)**: `reflect.hasMetadata(key, target, propertyKey?, parameterIndex?)`
- **Verificar próprio (sem protótipo)**: `reflect.hasOwnMetadata(key, target, propertyKey?, parameterIndex?)`
- **Remover**: `reflect.deleteMetadata(key, target, propertyKey?, parameterIndex?)`

Cada combinação de `target`, `propertyKey` e `parameterIndex` representa um local distinto para armazenamento de metadados:

- Classe: `target` = a classe (constructor), `propertyKey` = `undefined` (ou omitido)
- Atributo / Propriedade / Método de instância: `target` = `Class.prototype`, `propertyKey` = nome da propriedade/método
- Membro estático: ainda é comum gravar metadados no `prototype` para permitir leitura consistente via instâncias; os inicializadores estáticos podem ser executados na primeira instanciação (veja sobre [decorators](#uso-com-decorators))
- Parâmetros de método: use `parameterIndex` (0-based) junto com `target` e `propertyKey`
- Parâmetros do construtor: `target` = classe (constructor), `propertyKey` = `undefined`, `parameterIndex` = índice do parâmetro

**Exemplos**

Classe:

```ts
class MyClass {}

reflect.defineMetadata('role', 'service', MyClass)
reflect.getMetadata('role', MyClass) // 'service'
reflect.deleteMetadata('role', MyClass)
```

Propriedade (field) no protótipo:

```ts
class MyClass {
  prop: any
}

reflect.defineMetadata('key', 'value', MyClass.prototype, 'prop')
reflect.getMetadata('key', MyClass.prototype, 'prop') // 'value'
reflect.deleteMetadata('key', MyClass.prototype, 'prop')
```

Método:

```ts
class MyClass {
  method() {}
}

reflect.defineMetadata('key', true, MyClass.prototype, 'method')
reflect.hasMetadata('key', MyClass.prototype, 'method') // true
reflect.deleteMetadata('key', MyClass.prototype, 'method')
```

Parâmetro de método:

```ts
class MyClass {
  method(a: any, b: any) {}
}

reflect.defineMetadata('key', 'value', MyClass.prototype, 'method', 0)
reflect.getMetadata('key', MyClass.prototype, 'method', 0) // 'value'
reflect.deleteMetadata('key', MyClass.prototype, 'method', 0)
```

Parâmetro do construtor:

```ts
class MyClass {
  constructor(a: any) {}
}

reflect.defineMetadata('key', 'value', MyClass, undefined, 0)
reflect.getMetadata('key', MyClass, undefined, 0) // 'value'
reflect.deleteMetadata('key', MyClass, undefined, 0)
```

## Suporte a Symbol

Chaves do tipo `Symbol` também são suportadas como `key` em todas as operações acima.

## Uso com decorators

O `ReflectMetadata` fornece decorators utilitários que facilitam aplicar metadados direto na declaração:

- `reflect.metadata(key, value)` — decorator para classes, atributos, métodos e accessors. Em atributos e accessors, o metadado é gravado via inicializador (que costuma ser executado quando a classe é instanciada).
- `reflect.metadataParam(index, key, value)` — decorator para parâmetros (de método ou de construtor).

Exemplos:

```ts
// classe
@reflect.metadata('key', 'value')
class S {}

// atributo
class F {
  @reflect.metadata('key', 'value')
  field: any
}

// parâmetro de método
class P {
  @reflect.metadataParam(0, 'key', 'value')
  method(a: any) {}
}

// parâmetro de construtor
@reflect.metadataParam(0, 'key', 'value')
class C {
  constructor(a: any) {}
}
```

### Observações sobre decorators e inicializadores:

- Decorators aplicados a atributos/accessors geralmente gravam metadados através de um inicializador que executa no momento apropriado.
- Decorators de membros estáticos também utilizam inicializadores.

## Comportamentos importantes

- `hasMetadata` verifica a propriedade no alvo e na cadeia de protótipos (herdado). `hasOwnMetadata` verifica apenas no próprio alvo.
- `getMetadata` também observa a cadeia de protótipos;
- `getOwnMetadata` só retorna metadado definido diretamente no alvo.
- `deleteMetadata` remove o metadado no local informado (não varre protótipos).
- Parâmetros são indexados a partir de 0; para construtor use `target` = classe e `propertyKey` = `undefined`.
- Símbolos funcionam como chaves e mantêm identidade única.

## Container de Metadados isolados

O pacote fornece suporte para containers de metadados isolados através da classe `ReflectMetadata` — cada instância mantém seu próprio armazenamento interno de metadados.

Por padrão a biblioteca também exporta uma instância global conveniente chamada `Reflect` (veja a seção **Global instance** abaixo). Use containers isolados quando precisar evitar contaminação entre módulos, plugins, testes ou contextos de execução separados.

Quando usar um container isolado:

- Crie uma nova instância: `const local = new ReflectMetadata()`
- Use os mesmos métodos da API pública (`defineMetadata`, `getMetadata`, `hasMetadata`, `deleteMetadata`, `metadata`, `metadataParam`).
- Decorators gerados por uma instância escrevem no container dessa instância — portanto, ao aplicar decorators que gravam metadados, garanta que você leia os metadados pela mesma instância.

Exemplo de container isolado:

```ts
import { ReflectMetadata } from '@esliph/metadata'

const local = new ReflectMetadata()

class MyClass {}

local.defineMetadata('scope', 'local', MyClass)
console.log(local.getMetadata('scope', MyClass)) // 'local'

// O container global NÃO vê esse metadado:
import { Reflect } from '@esliph/metadata'

console.log(Reflect.hasMetadata('scope', MyClass)) // false
```

Exemplo: decorators com container isolado

Quando não usar um container isolado:

- Se você deseja metadados compartilhados entre toda a aplicação (ex.: decorators emitidos por bibliotecas que consumidores esperam ler), prefira a instância global `Reflect`.

**Global instance**

A biblioteca exporta uma instância global pronta para uso chamada `Reflect`. Exemplos de uso:

```ts
import { Reflect } from '@esliph/metadata'

Reflect.defineMetadata('globalKey', 'value', MyClass)
Reflect.getMetadata('globalKey', MyClass) // 'value'

// Decorator utilitário sobre a instância global
@Reflect.metadata('x', 1)
class G {}
```

## Exceções

| Exceção                                 | Código                    | Quando é lançada                                                                                                                 |
| --------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `InvalidTargetReflectMetadataException` | `TARGET_METADATA_INVALID` | Quando o alvo (`target` / `propertyKey`) informado para operações de metadata é considerado inválido para a operação solicitada. |

As exceções públicas relacionadas a metadata estendem `ReflectMetadataException` e carregam um `code` do enum `ReflectMetadataErrorCode`.
