import React from 'react'
import { cn } from '../../lib/utils'

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  showValue?: boolean
  unit?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, description, showValue = true, unit = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label className="text-sm font-medium text-text-primary">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm text-text-secondary">
                {props.value}{unit}
              </span>
            )}
          </div>
        )}
        
        <div className="relative">
          <input
            type="range"
            ref={ref}
            className={cn(
              'w-full h-2 bg-glass-light rounded-lg appearance-none cursor-pointer slider-thumb',
              className
            )}
            style={{
              background: `linear-gradient(to right, #03a9f4 0%, #03a9f4 ${((Number(props.value) - Number(props.min || 0)) / (Number(props.max || 100) - Number(props.min || 0))) * 100}%, rgba(255, 255, 255, 0.1) ${((Number(props.value) - Number(props.min || 0)) / (Number(props.max || 100) - Number(props.min || 0))) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
            }}
            {...props}
          />
        </div>
        
        {description && (
          <p className="text-xs text-text-tertiary">{description}</p>
        )}
      </div>
    )
  }
)
Slider.displayName = 'Slider'

export { Slider }
