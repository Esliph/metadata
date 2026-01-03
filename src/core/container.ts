import { MetadataKey, MetadataTarget, MetadataValue } from '@contracts/metadata'
import { assertValidTarget } from '@core/target'

export class MetadataContainer {

  protected static readonly NOT_FOUND = Symbol('NOT_FOUND')

  protected storage = new WeakMap<object, Map<any, any>>()

  protected lookupCache = new WeakMap<object, Map<any, any>>()

  defineMetadata(key: MetadataKey, value: MetadataValue, target: MetadataTarget, propertyKey?: PropertyKey) {
    const normalized = MetadataContainer.normalizeTarget(target, propertyKey)

    const map = this.getOrCreateMap(normalized)
    const compositeKey = MetadataContainer.makeCompositeKey(key, propertyKey)

    map.set(compositeKey, value)
    this.lookupCache.delete(normalized)
  }

  deleteMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey) {
    const normalized = MetadataContainer.normalizeTarget(target, propertyKey)
    const map = this.storage.get(normalized)

    if (!map) {
      return
    }

    const compositeKey = MetadataContainer.makeCompositeKey(key, propertyKey)

    map.delete(compositeKey)
    this.lookupCache.delete(normalized)
  }

  hasMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey) {
    return this.getMetadata(key, target, propertyKey) !== undefined
  }

  getMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey) {
    const normalized = MetadataContainer.normalizeTarget(target, propertyKey)
    const compositeKey = MetadataContainer.makeCompositeKey(key, propertyKey)

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

  protected static makeCompositeKey(key: MetadataKey, propertyKey?: PropertyKey) {
    if (propertyKey === undefined) {
      return key
    }

    const prop = String(propertyKey)
    const keyNormalized = typeof key === 'symbol' ? key.toString() : String(key)

    return prop + '|' + keyNormalized
  }

  protected static normalizeTarget(target: MetadataTarget, propertyKey?: PropertyKey) {
    assertValidTarget(target)

    if (propertyKey !== undefined) {
      if (typeof target === 'function') {
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
