import { MetadataKey, MetadataTarget, MetadataValue, PropertyKey } from '@contracts/metadata'
import { MetadataContainer } from '@core/container'

export class ReflectMetadata {

  protected container = new MetadataContainer()

  defineMetadata(key: MetadataKey, value: MetadataValue, target: MetadataTarget, propertyKey?: PropertyKey) {
    return this.container.defineMetadata(key, value, target, propertyKey)
  }

  deleteMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey) {
    return this.container.deleteMetadata(key, target, propertyKey)
  }

  getMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey) {
    return this.container.getMetadata(key, target, propertyKey)
  }

  hasMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey) {
    return this.container.hasMetadata(key, target, propertyKey)
  }
}
