import { ReflectMetadataErrorCode } from '@exceptions/code-errors'

export class ReflectMetadataException extends Error {

  constructor(
    public readonly code: ReflectMetadataErrorCode,
    message: string
  ) {
    super(message)
  }
}