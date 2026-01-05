import { MetadataKey, MetadataTarget, MetadataValue } from '@contracts/metadata'
import { assertValidTarget } from '@core/target'

export class MetadataContainer {

  protected static readonly NOT_FOUND = Symbol('NOT_FOUND')

  protected storage = new WeakMap<object, Map<any, any>>()

  protected lookupCache = new WeakMap<object, Map<any, any>>()

  defineMetadata(key: MetadataKey, value: MetadataValue, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    const normalized = MetadataContainer.normalizeTarget(target, propertyKey)

    const map = this.getOrCreateMap(normalized)
    const compositeKey = MetadataContainer.makeCompositeKey(key, propertyKey, parameterIndex)

    map.set(compositeKey, value)
    this.lookupCache.delete(normalized)
  }

  deleteMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    const normalized = MetadataContainer.normalizeTarget(target, propertyKey)
    const map = this.storage.get(normalized)

    if (!map) {
      return
    }

    const compositeKey = MetadataContainer.makeCompositeKey(key, propertyKey, parameterIndex)

    map.delete(compositeKey)
    this.lookupCache.delete(normalized)
  }

  hasMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    return this.getMetadata(key, target, propertyKey, parameterIndex) !== undefined
  }

  hasOwnMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    return this.getOwnMetadata(key, target, propertyKey, parameterIndex) !== undefined
  }

  getMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    const normalized = MetadataContainer.normalizeTarget(target, propertyKey)
    const compositeKey = MetadataContainer.makeCompositeKey(key, propertyKey, parameterIndex)

    const cache = this.lookupCache.get(normalized)

    if (cache && cache.has(compositeKey)) {
      const cached = cache.get(compositeKey)

      return cached === MetadataContainer.NOT_FOUND ? undefined : cached
    }

    let current: any = normalized

    while (current) {
      const containerMap = this.storage.get(current)

      if (containerMap && containerMap.has(compositeKey)) {
        const found = containerMap.get(compositeKey)
        const newCache = this.getOrCreateCacheMap(normalized)

        newCache.set(compositeKey, found)
        return found
      }

      current = Object.getPrototypeOf(current)
    }

    const newCache = this.getOrCreateCacheMap(normalized)

    newCache.set(compositeKey, MetadataContainer.NOT_FOUND)

    return undefined
  }

  getOwnMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    const normalized = MetadataContainer.normalizeTarget(target, propertyKey)
    const containerMap = this.storage.get(normalized)

    if (!containerMap) {
      return undefined
    }

    const compositeKey = MetadataContainer.makeCompositeKey(key, propertyKey, parameterIndex)

    return containerMap.get(compositeKey)
  }

  protected getOrCreateMap(target: object) {
    let map = this.storage.get(target)

    if (!map) {
      map = new Map()

      this.storage.set(target, map)
    }

    return map
  }

  protected getOrCreateCacheMap(target: object) {
    let map = this.lookupCache.get(target)

    if (!map) {
      map = new Map()

      this.lookupCache.set(target, map)
    }

    return map
  }

  protected static makeCompositeKey(key: MetadataKey, propertyKey?: PropertyKey, parameterIndex?: number) {
    if (propertyKey === undefined) {
      if (parameterIndex == undefined) {
        return key
      }

      propertyKey = 'constructor'
    }

    const prop = String(propertyKey)
    const keyNormalized = typeof key === 'symbol' ? key.toString() : String(key)

    if (parameterIndex === undefined) {
      return prop + '|' + keyNormalized
    }

    return prop + '|param:' + String(parameterIndex) + '|' + keyNormalized
  }

  protected static normalizeTarget(target: MetadataTarget, propertyKey?: PropertyKey) {
    assertValidTarget(target)

    if (propertyKey !== undefined) {
      if (typeof target === 'function') {
        if (String(propertyKey) === 'constructor') {
          return target as object
        }

        return target.prototype
      }

      return target as object
    }

    if (typeof target === 'object' && target !== null && (target as any).constructor) {
      return (target as any).constructor
    }

    return target as object
  }
}
