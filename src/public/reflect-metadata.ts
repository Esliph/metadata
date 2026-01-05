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

  getOwnMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    return this.container.getOwnMetadata(key, target, propertyKey, parameterIndex)
  }

  hasMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    return this.container.hasMetadata(key, target, propertyKey, parameterIndex)
  }

  hasOwnMetadata(key: MetadataKey, target: MetadataTarget, propertyKey?: PropertyKey, parameterIndex?: number) {
    return this.container.hasOwnMetadata(key, target, propertyKey, parameterIndex)
  }

  metadata(metadataKey: any, metadataValue: unknown) {
    const container = this.container

    return (value: any, context: DecoratorContext) => {
      if (context.kind == 'class') {
        container.defineMetadata(metadataKey, metadataValue, value)
        return
      }

      context.addInitializer(function () {
        const target = context.static ? this : (this as any).constructor.prototype

        container.defineMetadata(metadataKey, metadataValue, target, context.name)
      })
    }
  }

  metadataParam(param: number, metadataKey: any, metadataValue: unknown) {
    const container = this.container

    return (value: any, context: ClassDecoratorContext | ClassMethodDecoratorContext) => {
      if (context.kind == 'class') {
        container.defineMetadata(metadataKey, metadataValue, value, 'constructor', param)
        return
      }

      context.addInitializer(function () {
        const target = context.static ? this : (this as any).constructor.prototype

        container.defineMetadata(metadataKey, metadataValue, target, context.name, param)
      })
    }
  }
}
