import { MetadataTarget } from '@contracts/metadata'

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
