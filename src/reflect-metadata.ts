import { MetadataContainer, MetadataKey, MetadataPathInfo, MetadataTarget, MetadataValue, PropertyKey } from '@types'
import { assertValidTarget } from '@utils/target'

export class ReflectMetadata {

  protected storage = new WeakMap<object, MetadataContainer>()

  defineMetadata(key: MetadataKey, value: MetadataValue, target: MetadataTarget, propertyKey?: PropertyKey) {
    if (propertyKey !== undefined) {
      return this.definePropertyMetadata({ key, value }, target, propertyKey)
    }

    return this.defineClassMetadata({ key, value }, target)
  }

  deleteMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey) {
    const targetKey = ReflectMetadata.getTarget(target, propertyKey)
    const container = this.storage.get(targetKey)

    if (!container) {
      return
    }

    if (propertyKey !== undefined) {
      const prop = container.properties.get(propertyKey)

      if (prop) {
        prop.delete(key)
      }

      return
    }

    container.class.delete(key)
  }

  getMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey) {
    if (propertyKey !== undefined) {
      return this.lookupPropertyPrototype(key, target, propertyKey)
    }

    return this.lookupClassPrototype(key, target)
  }

  hasMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey) {
    return this.getMetadata(key, target, propertyKey) !== undefined
  }

  protected defineClassMetadata({ key, value }: MetadataPathInfo, target: MetadataTarget) {
    const container = this.getOrCreateTargetMetadataContainer(target)
    container.class.set(key, value)
  }

  protected definePropertyMetadata({ key, value }: MetadataPathInfo, target: MetadataTarget, propertyKey: PropertyKey) {
    const container = this.getOrCreateTargetMetadataContainer(target, propertyKey)

    let storage = container.properties.get(propertyKey)

    if (!storage) {
      storage = new Map()
      container.properties.set(propertyKey, storage)
    }

    storage.set(key, value)
  }

  protected lookupClassPrototype(key: MetadataKey, target: MetadataTarget) {
    let current: any = ReflectMetadata.getTarget(target)

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
    let current: any = ReflectMetadata.getTarget(target, propertyKey)

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

  protected getOrCreateTargetMetadataContainer(target: MetadataTarget, propertyKey?: PropertyKey): MetadataContainer {
    const targetKey = ReflectMetadata.getTarget(target, propertyKey)

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
