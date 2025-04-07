import { cn } from '@/lib/utils'
import { sizeVariants } from '@/lib/ui/tokens'
import type { SizeVariant } from '@/lib/ui/tokens'
import { FormSection } from './form-section'
import { getFieldComponent } from '@/lib/ui/forms/registry'

// Types for form configuration
export interface FieldConfig {
  id: string
  type: string
  label?: string
  description?: string
  error?: string
  className?: string
  value?: unknown
  onChange?: (value: unknown) => void
}

export interface FormLayoutConfig {
  id: string
  title?: string
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
  padding?: 'sm' | 'md' | 'lg'
  gap?: 'sm' | 'md' | 'lg'
}

const spacingMap = {
  sm: 'p-2 space-y-2',
  md: 'p-4 space-y-4',
  lg: 'p-6 space-y-6',
} as const

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

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col w-full',
        spacingMap[gap],
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
            title={section.title || 'Section'}
            description={section.description}
            padding={padding}
            gap={gap}
          >
            <div className={cn('grid', spacingMap[gap])}>
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
          'mt-4 px-4 py-2 rounded-md',
          'bg-primary text-white',
          'hover:bg-primary-hover transition-colors',
          'focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        Submit
      </button>
    </form>
  )
}

interface BaseInputProps {
  label?: string;
  error?: string;
  size?: SizeVariant;
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseInputProps {}

export const Input = ({
  label,
  error,
  size = 'md',
  className,
  ...props
}: InputProps) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        className={cn(
          'block w-full rounded-md border border-border',
          'bg-white text-text placeholder-text-muted',
          'focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-muted',
          error && 'border-danger focus:border-danger focus:ring-danger',
          sizeVariants[size],
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
};

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>, BaseInputProps {}

export const Textarea = ({
  label,
  error,
  size = 'md',
  className,
  ...props
}: TextareaProps) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'block w-full rounded-md border border-border',
          'bg-white text-text placeholder-text-muted',
          'focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-muted',
          error && 'border-danger focus:border-danger focus:ring-danger',
          sizeVariants[size],
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
};
