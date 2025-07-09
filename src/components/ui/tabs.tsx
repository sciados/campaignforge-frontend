// components/ui/tabs.tsx
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tabsListVariants = cva(
  "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-muted",
        card: "bg-card border rounded-lg p-1",
        pills: "bg-transparent space-x-1 p-0",
        underline: "bg-transparent border-b p-0 h-auto",
      },
      size: {
        default: "h-10",
        sm: "h-8",
        lg: "h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        card: "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        pills: "rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        underline: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent",
      },
      size: {
        default: "px-3 py-1.5",
        sm: "px-2 py-1 text-xs",
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const tabsContentVariants = cva(
  "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "mt-2",
        card: "mt-2 p-4 border rounded-lg",
        pills: "mt-4",
        underline: "mt-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface TabsProps 
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
    VariantProps<typeof tabsListVariants> {}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  />
))
Tabs.displayName = TabsPrimitive.Root.displayName

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant, size }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant, size }), className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>,
    VariantProps<typeof tabsContentVariants> {}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(tabsContentVariants({ variant }), className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// Enhanced Tabs with Icons and Badges
interface TabItem {
  value: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
  disabled?: boolean
}

interface EnhancedTabsProps extends Omit<TabsProps, 'children'> {
  tabs: TabItem[]
  children: React.ReactNode
}

const EnhancedTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  EnhancedTabsProps
>(({ className, tabs, children, variant, size, ...props }, ref) => (
  <Tabs ref={ref} className={className} {...props}>
    <TabsList variant={variant} size={size}>
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          variant={variant}
          size={size}
          disabled={tab.disabled}
          className="flex items-center gap-2"
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.badge && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
              {tab.badge}
            </span>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
    {children}
  </Tabs>
))
EnhancedTabs.displayName = "EnhancedTabs"

// Vertical Tabs Component
interface VerticalTabsProps extends TabsProps {
  tabsWidth?: string
}

const VerticalTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  VerticalTabsProps
>(({ className, tabsWidth = "w-48", children, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn("flex gap-4", className)}
    orientation="vertical"
    {...props}
  >
    {children}
  </TabsPrimitive.Root>
))
VerticalTabs.displayName = "VerticalTabs"

const VerticalTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { width?: string }
>(({ className, width = "w-48", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex flex-col h-auto items-stretch bg-muted p-1 rounded-md",
      width,
      className
    )}
    {...props}
  />
))
VerticalTabsList.displayName = "VerticalTabsList"

const VerticalTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-start whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
VerticalTabsTrigger.displayName = "VerticalTabsTrigger"

const VerticalTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "flex-1 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
VerticalTabsContent.displayName = "VerticalTabsContent"

// Scrollable Tabs Component
interface ScrollableTabsProps extends TabsProps {
  scrollButtons?: boolean
}

const ScrollableTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  ScrollableTabsProps
>(({ className, scrollButtons = true, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  />
))
ScrollableTabs.displayName = "ScrollableTabs"

const ScrollableTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <div className="relative">
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "flex items-center bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-hide",
        className
      )}
      {...props}
    />
  </div>
))
ScrollableTabsList.displayName = "ScrollableTabsList"

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  EnhancedTabs,
  VerticalTabs,
  VerticalTabsList,
  VerticalTabsTrigger,
  VerticalTabsContent,
  ScrollableTabs,
  ScrollableTabsList,
}

export type { 
  TabsProps, 
  TabsListProps, 
  TabsTriggerProps, 
  TabsContentProps, 
  TabItem, 
  EnhancedTabsProps,
  VerticalTabsProps,
  ScrollableTabsProps
}