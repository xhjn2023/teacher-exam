import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode
  description?: ReactNode
  title?: ReactNode
  action?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: {
    wrapper: 'py-8',
    icon: 'h-10 w-10',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    wrapper: 'py-12',
    icon: 'h-14 w-14',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    wrapper: 'py-20',
    icon: 'h-20 w-20',
    title: 'text-lg',
    description: 'text-sm',
  },
}

export const Empty = forwardRef<HTMLDivElement, EmptyProps>(
  (
    {
      icon,
      description,
      title,
      action,
      size = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const s = sizeClasses[size]

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-3 text-center',
          s.wrapper,
          className
        )}
        {...props}
      >
        {icon && (
          <div
            className={cn(
              'flex items-center justify-center text-zinc-300',
              s.icon
            )}
          >
            {icon}
          </div>
        )}
        {title && (
          <div className={cn('font-medium text-zinc-600', s.title)}>
            {title}
          </div>
        )}
        {description && (
          <div className={cn('text-zinc-400', s.description)}>
            {description}
          </div>
        )}
        {children}
        {action && <div className="mt-2">{action}</div>}
      </div>
    )
  }
)

Empty.displayName = 'Empty'

export default Empty
