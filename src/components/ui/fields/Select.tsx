'use client'

import { cn } from '@/lib/utils'
import { radii } from '@/lib/ui/tokens'
import { FieldWrapper } from './FieldWrapper'
import { Listbox } from '@headlessui/react'

interface SelectOption {
  value: string
  label: string
  online?: boolean
}

interface BaseSelectProps {
  label?: string
  options: SelectOption[]
  error?: string
  className?: string
}

interface SingleSelectProps extends BaseSelectProps {
  multiple?: false
  value: string
  onChange: (value: string) => void
}

interface MultiSelectProps extends BaseSelectProps {
  multiple: true
  value: string[]
  onChange: (value: string[]) => void
}

type SelectProps = SingleSelectProps | MultiSelectProps

export function Select({ 
  label, 
  options, 
  value, 
  onChange, 
  error, 
  className,
  multiple = false 
}: SelectProps) {
  return (
    <FieldWrapper id="select" label={label} error={error}>
      <Listbox value={value} onChange={onChange} multiple={multiple}>
        <div className="relative">
          <Listbox.Button
            className={cn(
              'relative w-full cursor-default bg-white px-3 py-1.5 text-left text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6',
              radii.md,
              error && 'outline-red-500 focus:outline-red-500',
              className
            )}
          >
            <span className="block truncate">
              {multiple 
                ? `${(value as string[]).length} selected`
                : options.find(option => option.value === value)?.label}
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  cn(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ selected, active }) => (
                  <>
                    <div className="flex items-center">
                      {option.online !== undefined && (
                        <span
                          className={cn(
                            'mr-2 h-2 w-2 rounded-full',
                            option.online ? 'bg-green-400' : 'bg-gray-400'
                          )}
                        />
                      )}
                      <span className={cn(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                        {option.label}
                      </span>
                    </div>
                    {selected && (
                      <span
                        className={cn(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-indigo-600'
                        )}
                      >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </FieldWrapper>
  )
}
