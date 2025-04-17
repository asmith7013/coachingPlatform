import { headingVariants, textVariants } from '@/lib/ui/sharedVariants'
import { cn } from '@/lib/utils'

// Token Groups
const colorTokens = {
  primary: ['primary', 'primary-hover', 'primary-active'],
  secondary: ['secondary', 'secondary-hover', 'secondary-active'],
  success: ['success', 'success-hover', 'success-active'],
  warning: ['warning', 'warning-hover', 'warning-active'],
  danger: ['danger', 'danger-hover', 'danger-active'],
  text: ['text', 'text-muted', 'text-disabled'],
  surface: ['surface', 'surface-hover', 'surface-active'],
  border: ['border', 'border-hover', 'border-active'],
}

const radiusTokens = ['none', 'sm', 'md', 'lg', 'xl', 'full']
const shadowTokens = ['none', 'sm', 'md', 'lg', 'xl']

function ColorSwatch({ name, group }: { name: string; group: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div 
        className={cn(
          'h-16 w-16 rounded-md',
          `bg-${group}-${name}`
        )}
      />
      <div className={textVariants({ size: 'sm' })}>
        {group}-{name}
      </div>
    </div>
  )
}

function RadiusSwatch({ value }: { value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div 
        className={cn(
          'h-16 w-16 border-2 border-primary bg-surface',
          `rounded-${value}`
        )}
      />
      <div className={textVariants({ size: 'sm' })}>
        radius-{value}
      </div>
    </div>
  )
}

function ShadowSwatch({ value }: { value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div 
        className={cn(
          'h-16 w-16 rounded-md bg-white',
          `shadow-${value}`
        )}
      />
      <div className={textVariants({ size: 'sm' })}>
        shadow-{value}
      </div>
    </div>
  )
}

export default function TokensPreview() {
  return (
    <div className="space-y-12">
      {/* Colors */}
      <section>
        <h2 className={headingVariants({ level: 'h2' })}>Colors</h2>
        <div className="mt-8 space-y-8">
          {Object.entries(colorTokens).map(([group, values]) => (
            <div key={group}>
              <h3 className={headingVariants({ level: 'h3' })}>{group}</h3>
              <div className="mt-4 grid grid-cols-6 gap-8">
                {values.map((name) => (
                  <ColorSwatch key={name} name={name} group={group} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius */}
      <section>
        <h2 className={headingVariants({ level: 'h2' })}>Border Radius</h2>
        <div className="mt-8 grid grid-cols-6 gap-8">
          {radiusTokens.map((value) => (
            <RadiusSwatch key={value} value={value} />
          ))}
        </div>
      </section>

      {/* Shadows */}
      <section>
        <h2 className={headingVariants({ level: 'h2' })}>Shadows</h2>
        <div className="mt-8 grid grid-cols-6 gap-8">
          {shadowTokens.map((value) => (
            <ShadowSwatch key={value} value={value} />
          ))}
        </div>
      </section>
    </div>
  )
} 