import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white shadow-lg hover:bg-primary-600 hover:shadow-xl active:scale-95',
        destructive: 'bg-error text-white shadow-lg hover:bg-red-600 hover:shadow-xl active:scale-95',
        outline: 'border border-glass-medium bg-glass-light text-text-primary backdrop-blur-md hover:bg-glass-medium hover:border-glass-strong',
        secondary: 'bg-secondary-500 text-white shadow-lg hover:bg-secondary-600 hover:shadow-xl active:scale-95',
        ghost: 'text-text-primary hover:bg-glass-light hover:text-text-primary',
        link: 'text-primary-500 underline-offset-4 hover:underline',
        glass: 'bg-glass-medium border border-glass-strong text-text-primary backdrop-blur-xl shadow-glass hover:bg-glass-strong hover:shadow-xl',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
