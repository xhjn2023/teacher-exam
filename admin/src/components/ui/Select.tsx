import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  hint?: string
  options?: SelectOption[]
  placeholder?: string
  required?: boolean
  wrapperClassName?: string
  suffix?: ReactNode
}

function ChevronDownIcon() {
  return (
    <svg
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options = [],
      placeholder,
      required = false,
      wrapperClassName,
      className,
      id,
      disabled,
      children,
      suffix,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const selectId = id || generatedId

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <div
          className={cn(
            'relative flex items-center rounded-lg border bg-white transition-base',
            'focus-within:ring-2 focus-within:ring-primary-500/30',
            error
              ? 'border-red-400 focus-within:border-red-500'
              : 'border-zinc-300 focus-within:border-primary-500',
            disabled && 'cursor-not-allowed bg-zinc-50 opacity-60'
          )}
        >
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              'h-10 w-full appearance-none bg-transparent pl-3 pr-9 text-sm text-zinc-800 focus:outline-none',
              'disabled:cursor-not-allowed',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </option>
            ))}
            {children}
          </select>
          <span className="pointer-events-none absolute right-3 flex items-center text-zinc-400">
            {suffix ?? <ChevronDownIcon />}
          </span>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-zinc-400">{hint}</p>
        ) : null}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
