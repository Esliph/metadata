import { MetadataKey, MetadataTarget, MetadataValue, PropertyKey } from '@contracts/metadata'
import { MetadataContainer } from '@core/container'

export class ReflectMetadata {

  protected container = new MetadataContainer()

  defineMetadata(key: MetadataKey, value: MetadataValue, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    return this.container.defineMetadata(key, value, target, propertyKey, parameterIndex)
  }

  deleteMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    return this.container.deleteMetadata(key, target, propertyKey, parameterIndex)
  }

  getMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    return this.container.getMetadata(key, target, propertyKey, parameterIndex)
  }

  hasMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    return this.container.hasMetadata(key, target, propertyKey, parameterIndex)
  }
}
