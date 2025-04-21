import { FieldWrapperVariants } from '@/components/core/fields/FieldWrapper'

export type FieldComponent = React.ComponentType<FieldWrapperVariants & {
  value?: unknown
  onChange?: (value: unknown) => void
}>

const registry: Record<string, FieldComponent> = {
  // This will be populated with actual field components
  // Example: text: TextInput, select: Select, etc.
}

export const getFieldComponent = (type: string): FieldComponent | undefined => {
  return registry[type]
}

export const registerFieldComponent = (type: string, component: FieldComponent) => {
  registry[type] = component
} 