export type MetadataTarget = Function | Object
export type MetadataKey = string | symbol
export type MetadataValue = unknown

export type PropertyKey = string | symbol

export type MetadataMap = Map<MetadataKey, MetadataValue>

export type ClassMetadataMap = MetadataMap
export type PropertyMetadataStore = Map<PropertyKey, MetadataMap>
export type MethodMetadataStore = Map<PropertyKey, MetadataMap>
export type ParameterMetadataStore = Map<PropertyKey, Map<number, MetadataMap>>

export interface MetadataContainer {
  class: ClassMetadataMap
  properties: PropertyMetadataStore
  methods: MethodMetadataStore
  parameters: ParameterMetadataStore
}

export type MetadataPathInfo = {
  key: MetadataKey
  value: MetadataValue
}
