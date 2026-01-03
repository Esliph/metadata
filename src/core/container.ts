import { MetadataKey, MetadataTarget, MetadataValue } from '@contracts/metadata'
import { assertValidTarget } from '@core/target'
import { MetadataStorage } from '@core/types'

export class MetadataContainer {

  protected storage = new WeakMap<object, MetadataStorage>()

  defineMetadata(key: MetadataKey, value: MetadataValue, target: MetadataTarget, propertyKey?: PropertyKey) {
    if (propertyKey !== undefined) {
      this.definePropertyMetadata(key, value, target, propertyKey)
      return
    }

    this.defineClassMetadata(key, value, target)
  }

  defineClassMetadata(key: MetadataKey, value: MetadataValue, target: MetadataTarget) {
    const container = this.getOrCreateMetadataStorage(target)
    container.class.set(key, value)
  }

  definePropertyMetadata(key: MetadataKey, value: MetadataValue, target: MetadataTarget, propertyKey: PropertyKey) {
    const container = this.getOrCreateMetadataStorage(target, propertyKey)

    let storage = container.properties.get(propertyKey)

    if (!storage) {
      storage = new Map()
      container.properties.set(propertyKey, storage)
    }

    storage.set(key, value)
  }

  deleteMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey) {
    if (propertyKey !== undefined) {
      this.deletePropertyMetadata(key, target, propertyKey)
      return
    }

    this.deleteClassMetadata(key, target)
  }

  deleteClassMetadata(key: MetadataKey, target: MetadataTarget) {
    const targetKey = MetadataContainer.getTarget(target)
    const container = this.storage.get(targetKey)

    if (!container) {
      return
    }

    container.class.delete(key)
  }

  deletePropertyMetadata(key: MetadataKey, target: MetadataTarget, propertyKey: PropertyKey) {
    const targetKey = MetadataContainer.getTarget(target, propertyKey)
    const container = this.storage.get(targetKey)

    if (!container) {
      return
    }

    const prop = container.properties.get(propertyKey)

    if (prop) {
      prop.delete(key)
    }
  }

  hasMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey) {
    return this.getMetadata(key, target, propertyKey) !== undefined
  }

  hasClassMetadata(key: MetadataKey, target: MetadataTarget) {
    return this.getClassMetadata(key, target) !== undefined
  }

  hasPropertyMetadata(key: MetadataKey, target: MetadataTarget, propertyKey: PropertyKey) {
    return this.getPropertyMetadata(key, target, propertyKey) !== undefined
  }

  getMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey) {
    if (propertyKey !== undefined) {
      return this.getPropertyMetadata(key, target, propertyKey)
    }

    return this.getClassMetadata(key, target)
  }

  getClassMetadata(key: MetadataKey, target: MetadataTarget) {
    return this.lookupClassPrototype(key, target)
  }

  getPropertyMetadata(key: MetadataKey, target: MetadataTarget, propertyKey: PropertyKey) {
    if (propertyKey !== undefined) {
      return this.lookupPropertyPrototype(key, target, propertyKey)
    }

    return this.lookupClassPrototype(key, target)
  }

  protected lookupClassPrototype(key: MetadataKey, target: MetadataTarget) {
    let current: any = MetadataContainer.getTarget(target)

    while (current) {
      const container = this.storage.get(current)

      if (container && container.class.has(key)) {
        return container.class.get(key)
      }

      current = Object.getPrototypeOf(current)
    }

    return undefined
  }

  protected lookupPropertyPrototype(key: MetadataKey, target: MetadataTarget, propertyKey: PropertyKey) {
    let current: any = MetadataContainer.getTarget(target, propertyKey)

    while (current) {
      const container = this.storage.get(current)

      if (container) {
        const storage = container.properties.get(propertyKey)

        if (storage && storage.has(key)) {
          return storage.get(key)
        }
      }

      current = Object.getPrototypeOf(current)
    }

    return undefined
  }

  protected getOrCreateMetadataStorage(target: MetadataTarget, propertyKey?: PropertyKey): MetadataStorage {
    const targetKey = MetadataContainer.getTarget(target, propertyKey)

    let container = this.storage.get(targetKey)

    if (!container) {
      container = {
        class: new Map(),
        properties: new Map(),
        methods: new Map(),
        parameters: new Map()
      }

      this.storage.set(targetKey, container)
    }

    return container
  }

  protected static getTarget(target: MetadataTarget, propertyKey?: PropertyKey) {
    assertValidTarget(target)

    if (propertyKey !== undefined) {
      if (typeof target === 'function') {
        return target.prototype
      }

      return target
    }

    if (typeof target === 'object' && target !== null && (target as any).constructor) {
      return (target as any).constructor
    }

    return target
  }
}
