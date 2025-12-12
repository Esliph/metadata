import { MetadataContainer, MetadataKey, MetadataTarget, MetadataValue } from '@types'

export class ReflectMetadata {

  private storage = new WeakMap<object, MetadataContainer>()

  defineMetadata(key: MetadataKey, value: MetadataValue, target: MetadataTarget) {
    const targetContainer = this.getOrCreateTargetMetadataContainer(target)

    targetContainer.class.set(key, value)
  }

  deleteMetadata(key: MetadataKey, target: MetadataTarget) {
    const targetKey = ReflectMetadata.getTarget(target)

    const targetContainer = this.storage.get(targetKey)

    if (!targetContainer) {
      return
    }

    targetContainer.class.delete(key)
  }

  getMetadata(key: MetadataKey, target: MetadataTarget) {
    return this.lookupPrototype(target, container => container.class.get(key))
  }

  hasMetadata(key: MetadataKey, target: MetadataTarget) {
    return this.lookupPrototype(target, container => container.class.get(key)) !== undefined
  }

  private lookupPrototype(target: MetadataTarget, fn: (record: MetadataContainer) => any) {
    let current = ReflectMetadata.getTarget(target)

    while (current) {
      const container = this.storage.get(current)

      if (container) {
        const value = fn(container)

        if (value !== undefined) {
          return value
        }
      }

      current = Object.getPrototypeOf(current)
    }

    return undefined
  }

  private getOrCreateTargetMetadataContainer(target: MetadataTarget): MetadataContainer {
    const targetKey = ReflectMetadata.getTarget(target)

    if (!this.storage.has(targetKey)) {
      this.storage.set(targetKey, {
        class: new Map(),
        properties: new Map(),
        methods: new Map(),
        parameters: new Map()
      })
    }

    return this.storage.get(targetKey)!
  }

  private static getTarget(target: MetadataTarget) {
    return typeof target === 'object' && target.constructor
      ? target.constructor
      : target
  }
}