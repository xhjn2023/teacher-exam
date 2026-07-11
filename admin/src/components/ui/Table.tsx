import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

export type SortDirection = 'asc' | 'desc' | null

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    { bordered = false, striped = false, hoverable = true, className, ...props },
    ref
  ) => {
    return (
      <div className="w-full overflow-x-auto">
        <table
          ref={ref}
          className={cn(
            'w-full border-collapse text-left text-sm',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Table.displayName = 'Table'

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn('bg-zinc-50 text-zinc-500', className)}
        {...props}
      />
    )
  }
)
TableHeader.displayName = 'TableHeader'

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return <tbody ref={ref} className={cn(className)} {...props} />
  }
)
TableBody.displayName = 'TableBody'

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean
  striped?: boolean
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ hoverable = true, className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-zinc-100 transition-base',
          hoverable && 'hover:bg-zinc-50',
          className
        )}
        {...props}
      />
    )
  }
)
TableRow.displayName = 'TableRow'

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sortDirection?: SortDirection
  onSort?: () => void
  align?: 'left' | 'center' | 'right'
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      sortable = false,
      sortDirection = null,
      onSort,
      align = 'left',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const alignClass =
      align === 'center'
        ? 'text-center'
        : align === 'right'
        ? 'text-right'
        : 'text-left'

    return (
      <th
        ref={ref}
        className={cn(
          'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide',
          alignClass,
          sortable && 'cursor-pointer select-none hover:text-zinc-700',
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <span
          className={cn(
            'inline-flex items-center gap-1',
            align === 'right' && 'flex-row-reverse'
          )}
        >
          {children}
          {sortable && (
            <span className="inline-flex flex-col leading-none text-zinc-400">
              <span
                className={cn(
                  'text-[8px]',
                  sortDirection === 'asc' ? 'text-primary-600' : 'text-zinc-300'
                )}
              >
                ▲
              </span>
              <span
                className={cn(
                  'text-[8px]',
                  sortDirection === 'desc' ? 'text-primary-600' : 'text-zinc-300'
                )}
              >
                ▼
              </span>
            </span>
          )}
        </span>
      </th>
    )
  }
)
TableHead.displayName = 'TableHead'

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right'
  ellipsis?: boolean
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  (
    { align = 'left', ellipsis = false, className, children, ...props },
    ref
  ) => {
    const alignClass =
      align === 'center'
        ? 'text-center'
        : align === 'right'
        ? 'text-right'
        : 'text-left'

    return (
      <td
        ref={ref}
        className={cn(
          'px-4 py-3 text-sm text-zinc-700',
          alignClass,
          ellipsis && 'max-w-xs truncate',
          className
        )}
        {...props}
      >
        {children}
      </td>
    )
  }
)
TableCell.displayName = 'TableCell'

export interface TableEmptyProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  description?: ReactNode
}

export const TableEmpty = forwardRef<HTMLDivElement, TableEmptyProps>(
  ({ icon, description = '暂无数据', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-2 py-12 text-zinc-400',
          className
        )}
        {...props}
      >
        {icon && <div className="text-zinc-300">{icon}</div>}
        <div className="text-sm">{description}</div>
      </div>
    )
  }
)
TableEmpty.displayName = 'TableEmpty'

export default Table
