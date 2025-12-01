import { useState } from 'react';

interface SectionOption {
  id: string;
  name: string; // Display name shown in tile (e.g., "Ramp Ups", "Section A")
  inStock?: boolean; // Whether this section has lessons (defaults to true)
  count?: number; // Number of lessons in this section
}

interface SectionRadioGroupProps {
  options: SectionOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export function SectionRadioGroup({
  options,
  value,
  onChange,
  label = 'Section of Unit',
  disabled = false,
}: SectionRadioGroupProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  return (
    <fieldset aria-label={label} disabled={disabled}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const isDisabled = disabled || option.inStock === false;

          return (
            <div
              key={option.id}
              className="relative flex"
              onMouseEnter={() => !isDisabled && setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
            >
              <label
                aria-label={option.name}
                className="group relative flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 h-[42px] min-w-fit flex-1 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-600 hover:bg-gray-100 has-[:checked]:hover:bg-indigo-600 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-600 has-[:disabled]:border-gray-400 has-[:disabled]:bg-gray-200 has-[:disabled]:opacity-25 has-[:disabled]:hover:bg-gray-200 cursor-pointer has-[:disabled]:cursor-not-allowed transition-colors"
              >
                <input
                  value={option.id}
                  checked={value === option.id}
                  onChange={(e) => onChange(e.target.value)}
                  name="section"
                  type="radio"
                  disabled={isDisabled}
                  className="absolute inset-0 appearance-none opacity-0 focus:outline-none disabled:cursor-not-allowed cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900 group-has-[:checked]:text-white whitespace-nowrap pointer-events-none">
                  {option.name}
                </span>
              </label>

              {/* Tooltip */}
              {hoveredOption === option.id && !isDisabled && option.count !== undefined && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                    <div className="text-gray-300">
                      {option.count} {option.count === 1 ? 'lesson' : 'lessons'}
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
