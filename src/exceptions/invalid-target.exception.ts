import { ReflectMetadataException } from '@exceptions/reflect-dependency.exception'
import { ReflectMetadataErrorCode } from '@exceptions/code-errors'

export class InvalidTargetReflectMetadataException extends ReflectMetadataException {

  constructor(message: string) {
    super(ReflectMetadataErrorCode.TARGET_METADATA_INVALID, message)
  }
}
