import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  bordered?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, bordered = true, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg bg-white shadow-card transition-base',
          bordered && 'border border-zinc-200',
          hoverable && 'hover:shadow-card-hover hover:border-zinc-300',
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  subtitle?: ReactNode
  extra?: ReactNode
  bordered?: boolean
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    { title, subtitle, extra, bordered = true, className, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4 px-5 py-4',
          bordered && 'border-b border-zinc-100',
          className
        )}
        {...props}
      >
        <div className="min-w-0 flex-1">
          {title && (
            <div className="text-base font-semibold text-zinc-800">{title}</div>
          )}
          {subtitle && (
            <div className="mt-1 text-sm text-zinc-500">{subtitle}</div>
          )}
          {children}
        </div>
        {extra && <div className="shrink-0">{extra}</div>}
      </div>
    )
  }
)
CardHeader.displayName = 'CardHeader'

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-base font-semibold text-zinc-800', className)}
        {...props}
      />
    )
  }
)
CardTitle.displayName = 'CardTitle'

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ padded = true, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(padded && 'px-5 py-4', className)}
        {...props}
      />
    )
  }
)
CardBody.displayName = 'CardBody'

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ bordered = true, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 px-5 py-4',
          bordered && 'border-t border-zinc-100',
          className
        )}
        {...props}
      />
    )
  }
)
CardFooter.displayName = 'CardFooter'

export default Card
