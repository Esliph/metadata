import { InvalidTargetReflectMetadataException } from '@exceptions/invalid-target.exception'
import { isValidTarget } from '@utils/target'

export function assertValidTarget(target: any) {
  if (!isValidTarget(target)) {
    throw new InvalidTargetReflectMetadataException(`The target must be a "function (class)" or an "object", but a "${typeof target}" was received.`)
  }
}
