import { cn } from '@/lib/utils'
import { spacing, radii, colorVariants } from '@/lib/ui/tokens'
import { FormSection } from './form-section'
import { getFieldComponent } from '@/lib/ui/forms/registry'

// Types for form configuration
export interface FieldConfig {
  id: string
  type: string
  label: string
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  validation?: {
    required?: boolean
    pattern?: RegExp
    message?: string
  }
}

export interface FormLayoutConfig {
  id: string
  title: string
  description?: string
  fieldIds: string[]
}

interface FormProps {
  formLayout: FormLayoutConfig[]
  fields: FieldConfig[]
  values?: Record<string, unknown>
  onChange?: (key: string, value: unknown) => void
  onSubmit?: (values: Record<string, unknown>) => void
  className?: string
  padding?: keyof typeof spacing
  gap?: keyof typeof spacing
}

export function Form({
  formLayout,
  fields,
  values = {},
  onChange,
  onSubmit,
  className,
  padding = 'lg',
  gap = 'md',
}: FormProps) {
  // Create a map of field configs for easy lookup
  const fieldMap = fields.reduce((acc, field) => {
    acc[field.id] = field
    return acc
  }, {} as Record<string, FieldConfig>)

  const handleChange = (key: string, value: unknown) => {
    onChange?.(key, value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(values)
  }

  const paddingClass = spacing[padding]
  const gapClass = spacing[gap]

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col w-full',
        gapClass,
        paddingClass,
        className
      )}
    >
      {formLayout.map((section) => {
        const sectionFields = section.fieldIds
          .map(id => fieldMap[id])
          .filter(Boolean)

        return (
          <FormSection
            key={section.id}
            title={section.title}
            description={section.description}
            padding={padding}
            gap={gap}
          >
            <div className={cn('grid', gapClass)}>
              {sectionFields.map((field) => {
                const FieldComponent = getFieldComponent(field.type)
                if (!FieldComponent) {
                  console.warn(`No component found for field type: ${field.type}`)
                  return null
                }

                return (
                  <FieldComponent
                    key={field.id}
                    {...field}
                    value={values[field.id]}
                    onChange={(value: unknown) => handleChange(field.id, value)}
                  />
                )
              })}
            </div>
          </FormSection>
        )
      })}

      <button
        type="submit"
        className={cn(
          'mt-md px-md py-sm',
          radii.md,
          colorVariants.primary,
          'text-white',
          'hover:bg-primary-dark transition-colors'
        )}
      >
        Submit
      </button>
    </form>
  )
}
