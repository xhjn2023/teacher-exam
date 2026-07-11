import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: ReactNode
  suffix?: ReactNode
  required?: boolean
  wrapperClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      prefix,
      suffix,
      required = false,
      wrapperClassName,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <div
          className={cn(
            'flex items-center rounded-lg border bg-white transition-base',
            'focus-within:ring-2 focus-within:ring-primary-500/30',
            error
              ? 'border-red-400 focus-within:border-red-500'
              : 'border-zinc-300 focus-within:border-primary-500',
            disabled && 'cursor-not-allowed bg-zinc-50 opacity-60'
          )}
        >
          {prefix && (
            <span className="flex shrink-0 items-center pl-3 text-zinc-400">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'h-10 w-full bg-transparent px-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none',
              prefix && 'pl-2',
              suffix && 'pr-2',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="flex shrink-0 items-center pr-3 text-zinc-400">
              {suffix}
            </span>
          )}
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

Input.displayName = 'Input'

export default Input
