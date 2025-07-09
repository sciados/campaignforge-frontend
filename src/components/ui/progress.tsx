// components/ui/progress.tsx
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative h-4 w-full overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-secondary",
        success: "bg-green-200 dark:bg-green-900/20",
        warning: "bg-yellow-200 dark:bg-yellow-900/20",
        danger: "bg-red-200 dark:bg-red-900/20",
        info: "bg-blue-200 dark:bg-blue-900/20",
      },
      size: {
        default: "h-4",
        sm: "h-2",
        lg: "h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-green-600 dark:bg-green-500",
        warning: "bg-yellow-600 dark:bg-yellow-500",
        danger: "bg-red-600 dark:bg-red-500",
        info: "bg-blue-600 dark:bg-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  value?: number
  max?: number
  showLabel?: boolean
  label?: string
  animated?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value = 0, 
  max = 100, 
  variant, 
  size, 
  showLabel = false, 
  label, 
  animated = true,
  ...props 
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  return (
    <div className="w-full space-y-2">
      {(showLabel || label) && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {label || "Progress"}
          </span>
          <span className="font-medium">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressVariants({ variant, size }), className)}
        value={value}
        max={max}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            progressIndicatorVariants({ variant }),
            animated && "animate-pulse"
          )}
          style={{ 
            transform: `translateX(-${100 - percentage}%)`,
            transition: animated ? "transform 0.5s ease-in-out" : "none"
          }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

// Circular Progress Component
interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: "default" | "success" | "warning" | "danger" | "info"
  showLabel?: boolean
  label?: string
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    size = 120, 
    strokeWidth = 8, 
    variant = "default", 
    showLabel = true, 
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    
    const colorMap = {
      default: "text-primary",
      success: "text-green-600",
      warning: "text-yellow-600", 
      danger: "text-red-600",
      info: "text-blue-600"
    }
    
    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted-foreground/20"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(colorMap[variant], "transition-all duration-500 ease-in-out")}
          />
        </svg>
        
        {/* Label */}
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">
              {Math.round(percentage)}%
            </span>
            {label && (
              <span className="text-sm text-muted-foreground mt-1">
                {label}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = "CircularProgress"

// Multi-step Progress Component
interface Step {
  id: string
  title: string
  description?: string
  status: "pending" | "current" | "completed" | "error"
}

interface StepProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Step[]
  currentStep?: number
  variant?: "default" | "success" | "warning" | "danger" | "info"
}

const StepProgress = React.forwardRef<HTMLDivElement, StepProgressProps>(
  ({ className, steps, currentStep = 0, variant = "default", ...props }, ref) => {
    const colorMap = {
      default: {
        completed: "bg-primary text-primary-foreground",
        current: "bg-primary text-primary-foreground border-primary",
        pending: "bg-muted text-muted-foreground",
        error: "bg-destructive text-destructive-foreground"
      },
      success: {
        completed: "bg-green-600 text-white",
        current: "bg-green-600 text-white border-green-600",
        pending: "bg-muted text-muted-foreground",
        error: "bg-red-600 text-white"
      },
      warning: {
        completed: "bg-yellow-600 text-white",
        current: "bg-yellow-600 text-white border-yellow-600",
        pending: "bg-muted text-muted-foreground",
        error: "bg-red-600 text-white"
      },
      danger: {
        completed: "bg-red-600 text-white",
        current: "bg-red-600 text-white border-red-600",
        pending: "bg-muted text-muted-foreground",
        error: "bg-red-600 text-white"
      },
      info: {
        completed: "bg-blue-600 text-white",
        current: "bg-blue-600 text-white border-blue-600",
        pending: "bg-muted text-muted-foreground",
        error: "bg-red-600 text-white"
      }
    }
    
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2",
                    colorMap[variant][step.status]
                  )}
                >
                  {step.status === "completed" ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : step.status === "error" ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium">{step.title}</div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-1">{step.description}</div>
                  )}
                </div>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-muted mx-4 mt-5" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }
)
StepProgress.displayName = "StepProgress"

export { Progress, CircularProgress, StepProgress }
export type { ProgressProps, CircularProgressProps, StepProgressProps, Step }