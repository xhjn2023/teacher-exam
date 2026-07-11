import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

export interface SearchBarProps {
  value?: string
  defaultValue?: string
  placeholder?: string
  debounce?: number
  onSearch?: (value: string) => void
  onChange?: (value: string) => void
  onClear?: () => void
  searchIcon?: ReactNode
  clearIcon?: ReactNode
  disabled?: boolean
  className?: string
  autoFocus?: boolean
}

function DefaultSearchIcon() {
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
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function DefaultClearIcon() {
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
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function SearchBar({
  value: controlledValue,
  defaultValue = '',
  placeholder = '请输入关键词搜索',
  debounce = 300,
  onSearch,
  onChange,
  onClear,
  searchIcon,
  clearIcon,
  disabled = false,
  className,
  autoFocus = false,
}: SearchBarProps) {
  const isControlled = controlledValue !== undefined
  const [innerValue, setInnerValue] = useState(defaultValue)
  const value = isControlled ? controlledValue : innerValue

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  const triggerSearch = (val: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(() => {
      onSearch?.(val)
    }, debounce)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!isControlled) {
      setInnerValue(val)
    }
    onChange?.(val)
    triggerSearch(val)
  }

  const handleClear = () => {
    if (!isControlled) {
      setInnerValue('')
    }
    onChange?.('')
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    onSearch?.('')
    onClear?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      onSearch?.(value)
    }
  }

  return (
    <div
      className={cn(
        'flex items-center rounded-lg border border-zinc-300 bg-white transition-base',
        'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30',
        disabled && 'cursor-not-allowed bg-zinc-50 opacity-60',
        className
      )}
    >
      <span className="flex shrink-0 items-center pl-3 text-zinc-400">
        {searchIcon ?? <DefaultSearchIcon />}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="h-10 w-full bg-transparent px-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="flex shrink-0 items-center pr-3 text-zinc-400 transition-base hover:text-zinc-600 focus:outline-none"
          aria-label="清除"
        >
          {clearIcon ?? <DefaultClearIcon />}
        </button>
      )}
    </div>
  )
}

export default SearchBar
