import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  current: number
  pageSize: number
  total: number
  onChange: (page: number) => void
  showTotal?: boolean
  showJumper?: boolean
  siblingCount?: number
  className?: string
  prevIcon?: ReactNode
  nextIcon?: ReactNode
}

function ChevronLeft() {
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
        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ChevronRight() {
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
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function buildPageRange(
  current: number,
  total: number,
  siblingCount: number
): (number | '...')[] {
  const totalNumbers = siblingCount * 2 + 5
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(current - siblingCount, 1)
  const rightSibling = Math.min(current + siblingCount, total)

  const showLeftDots = leftSibling > 2
  const showRightDots = rightSibling < total - 1

  const pages: (number | '...')[] = [1]

  if (showLeftDots) {
    pages.push('...')
  } else {
    for (let i = 2; i < leftSibling; i++) {
      pages.push(i)
    }
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (!pages.includes(i)) pages.push(i)
  }

  if (showRightDots) {
    pages.push('...')
  } else {
    for (let i = rightSibling + 1; i < total; i++) {
      if (!pages.includes(i)) pages.push(i)
    }
  }

  if (!pages.includes(total)) pages.push(total)

  return pages
}

export function Pagination({
  current,
  pageSize,
  total,
  onChange,
  showTotal = true,
  showJumper = true,
  siblingCount = 1,
  className,
  prevIcon,
  nextIcon,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const [jumpValue, setJumpValue] = useState('')

  const pages = useMemo(
    () => buildPageRange(current, totalPages, siblingCount),
    [current, totalPages, siblingCount]
  )

  const start = total === 0 ? 0 : (current - 1) * pageSize + 1
  const end = Math.min(current * pageSize, total)

  const handleJump = () => {
    const page = parseInt(jumpValue, 10)
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      onChange(page)
    }
    setJumpValue('')
  }

  const isPrevDisabled = current <= 1
  const isNextDisabled = current >= totalPages

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600',
        className
      )}
    >
      {showTotal ? (
        <div className="text-zinc-500">
          共 <span className="font-medium text-zinc-700">{total}</span> 条，
          第 <span className="font-medium text-zinc-700">{start}-{end}</span> 条
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={isPrevDisabled}
          onClick={() => onChange(current - 1)}
          className={cn(
            'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-zinc-200 px-2 transition-base',
            'hover:border-primary-400 hover:text-primary-600',
            'disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-300 disabled:hover:border-zinc-200'
          )}
          aria-label="上一页"
        >
          {prevIcon ?? <ChevronLeft />}
        </button>

        {pages.map((page, idx) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="inline-flex h-8 min-w-[2rem] items-center justify-center px-1 text-zinc-400"
              >
                ...
              </span>
            )
          }
          const active = page === current
          return (
            <button
              key={page}
              type="button"
              onClick={() => onChange(page)}
              className={cn(
                'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border px-2 transition-base',
                active
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-zinc-200 text-zinc-600 hover:border-primary-400 hover:text-primary-600'
              )}
            >
              {page}
            </button>
          )
        })}

        <button
          type="button"
          disabled={isNextDisabled}
          onClick={() => onChange(current + 1)}
          className={cn(
            'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-zinc-200 px-2 transition-base',
            'hover:border-primary-400 hover:text-primary-600',
            'disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-300 disabled:hover:border-zinc-200'
          )}
          aria-label="下一页"
        >
          {nextIcon ?? <ChevronRight />}
        </button>

        {showJumper && totalPages > 1 && (
          <div className="ml-2 flex items-center gap-1.5 text-zinc-500">
            <span>跳至</span>
            <input
              type="text"
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJump()
              }}
              onBlur={handleJump}
              className="h-8 w-12 rounded-md border border-zinc-200 text-center text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
            <span>页</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pagination
