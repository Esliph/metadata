import { MetadataKey, MetadataValue } from '@contracts/metadata'

export type MetadataMap = Map<MetadataKey, MetadataValue>

export type ClassMetadataMap = MetadataMap
export type PropertyMetadataStore = Map<PropertyKey, MetadataMap>
export type MethodMetadataStore = Map<PropertyKey, MetadataMap>
export type ParameterMetadataStore = Map<PropertyKey, Map<number, MetadataMap>>

export interface MetadataStorage {
  class: ClassMetadataMap
  properties: PropertyMetadataStore
  methods: MethodMetadataStore
  parameters: ParameterMetadataStore
}
