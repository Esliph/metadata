import { InvalidTargetReflectMetadataException } from '@exceptions/invalid-target.exception'
import { MetadataTarget } from '@types'

export function assertValidTarget(target: any) {
  if (!isValidTarget(target)) {
    throw new InvalidTargetReflectMetadataException(`The target must be a "function (class)" or an "object", but a "${typeof target}" was received.`)
  }
}

export function isValidTarget(target: any): target is MetadataTarget {
  if (!target) {
    return false
  }

  const type = typeof target

  if (type === 'function') {
    return target.prototype !== undefined && target.constructor.name != 'GeneratorFunction'
  }

  return type === 'object'
}
