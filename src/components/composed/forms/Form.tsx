import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import { FormSection } from './FormSection'
import { getFieldComponent } from '@ui-forms/registry'
import { textColors } from '@ui-tokens/tokens'

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

// 🎨 Form style variants
export const form = tv({
  slots: {
    root: [
      'flex flex-col w-full',
    ],
    fields: [
      'grid',
    ],
    submit: [
      'mt-4 px-4 py-2 rounded-md',
      'bg-primary text-white',
      'hover:bg-primary-hover transition-colors',
      'focus:ring-2 focus:ring-primary focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ],
  },
  variants: {
    padding: {
      sm: { 
        root: 'p-4',
        fields: 'p-2',
      },
      md: { 
        root: 'p-6',
        fields: 'p-3',
      },
      lg: { 
        root: 'p-8',
        fields: 'p-4',
      },
    },
    gap: {
      sm: { 
        root: 'space-y-2',
        fields: 'gap-2',
      },
      md: { 
        root: 'space-y-4',
        fields: 'gap-4',
      },
      lg: { 
        root: 'space-y-6',
        fields: 'gap-6',
      },
    },
  },
  defaultVariants: {
    padding: 'md',
    gap: 'md',
  },
})

// 🎨 Form field style variants
export const formField = tv({
  slots: {
    root: [
      'space-y-1',
    ],
    label: [
      'block font-medium',
      textColors.default,
    ],
    input: [
      'block w-full rounded-md border border-border',
      'bg-white',
      textColors.default,
      'placeholder:' + textColors.muted,
      'focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-muted',
    ],
    error: [
      'mt-1',
      textColors.danger,
    ],
  },
  variants: {
    textSize: {
      xs: { label: 'text-xs', input: 'text-xs', error: 'text-xs' },
      sm: { label: 'text-sm', input: 'text-sm', error: 'text-xs' },
      base: { label: 'text-base', input: 'text-base', error: 'text-sm' },
      lg: { label: 'text-lg', input: 'text-lg', error: 'text-base' },
      xl: { label: 'text-xl', input: 'text-xl', error: 'text-lg' },
    },
    padding: {
      xs: { input: 'px-2 py-1' },
      sm: { input: 'px-3 py-1.5' },
      md: { input: 'px-4 py-2' },
      lg: { input: 'px-5 py-2.5' },
      xl: { input: 'px-6 py-3' },
    },
    error: {
      true: {
        input: 'border-danger focus:border-danger focus:ring-danger',
      },
    },
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
  },
})

// ✅ Export for atomic style use elsewhere
export const formStyles = form
export const formFieldStyles = formField

// ✅ Export type for variant props
export type FormVariants = Parameters<typeof form>[0]
export type FormFieldVariants = VariantProps<typeof formField>

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

  const styles = form({ padding, gap })

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(styles.root(), className)}
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
            <div className={styles.fields()}>
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
        className={styles.submit()}
      >
        Submit
      </button>
    </form>
  )
}

interface BaseInputProps {
  label?: string;
  error?: string;
  textSize?: FormFieldVariants['textSize'];
  padding?: FormFieldVariants['padding'];
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseInputProps {}

export const Input = ({
  label,
  error,
  textSize = 'base',
  padding = 'md',
  className,
  ...props
}: InputProps) => {
  const styles = formField({ textSize, padding, error: !!error });

  return (
    <div className={cn(styles.root(), className)}>
      {label && (
        <label className={styles.label()}>{label}</label>
      )}
      <input
        className={styles.input()}
        {...props}
      />
      {error && (
        <p className={styles.error()}>{error}</p>
      )}
    </div>
  );
};

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>, BaseInputProps {}

export const Textarea = ({
  label,
  error,
  textSize = 'base',
  padding = 'md',
  className,
  ...props
}: TextareaProps) => {
  const styles = formField({ textSize, padding, error: !!error });

  return (
    <div className={cn(styles.root(), className)}>
      {label && (
        <label className={styles.label()}>{label}</label>
      )}
      <textarea
        className={styles.input()}
        {...props}
      />
      {error && (
        <p className={styles.error()}>{error}</p>
      )}
    </div>
  );
};

export interface FormFieldProps extends 
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string | boolean;
  textSize?: FormFieldVariants['textSize'];
  padding?: FormFieldVariants['padding'];
}

export const FormField = ({
  label,
  error,
  textSize = 'base',
  padding = 'md',
  className,
  ...props
}: FormFieldProps) => {
  const styles = formField({ textSize, padding, error: !!error });

  return (
    <div className={cn(styles.root(), className)}>
      {label && (
        <label className={styles.label()}>{label}</label>
      )}
      <input
        className={styles.input()}
        {...props}
      />
      {error && (
        <p className={styles.error()}>{error}</p>
      )}
    </div>
  );
};
