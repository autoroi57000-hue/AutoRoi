'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Context ────────────────────────────────────────────────────────────────

interface AccordionContextValue {
  openItems: string[]
  toggle: (value: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openItems: [],
  toggle: () => {},
})

const ItemContext = React.createContext<string>('')

// ─── Accordion ──────────────────────────────────────────────────────────────

interface AccordionProps {
  type?: 'single' | 'multiple'
  collapsible?: boolean
  className?: string
  children: React.ReactNode
  defaultValue?: string | string[]
  value?: string[]
  onValueChange?: (value: string[]) => void
}

const Accordion = ({
  type = 'multiple',
  className,
  children,
  defaultValue,
  value: controlledValue,
  onValueChange,
}: AccordionProps) => {
  const [internalValue, setInternalValue] = React.useState<string[]>(() => {
    if (controlledValue) return controlledValue
    if (!defaultValue) return []
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  })

  const openItems = controlledValue ?? internalValue

  const toggle = React.useCallback(
    (item: string) => {
      const next = openItems.includes(item)
        ? openItems.filter((v) => v !== item)
        : type === 'single'
          ? [item]
          : [...openItems, item]

      if (onValueChange) {
        onValueChange(next)
      } else {
        setInternalValue(next)
      }
    },
    [openItems, onValueChange, type]
  )

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn('space-y-2', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

// ─── AccordionItem ──────────────────────────────────────────────────────────

interface AccordionItemProps {
  value: string
  className?: string
  children: React.ReactNode
  id?: string
}

const AccordionItem = ({ value, className, children, id }: AccordionItemProps) => {
  const { openItems } = React.useContext(AccordionContext)
  const isOpen = openItems.includes(value)

  return (
    <ItemContext.Provider value={value}>
      <div
        id={id}
        className={cn('border-b border-ar-gray/50', className)}
        data-state={isOpen ? 'open' : 'closed'}
      >
        {children}
      </div>
    </ItemContext.Provider>
  )
}

// ─── AccordionTrigger ───────────────────────────────────────────────────────

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children: React.ReactNode
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { openItems, toggle } = React.useContext(AccordionContext)
    const value = React.useContext(ItemContext)
    const isOpen = openItems.includes(value)

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => toggle(value)}
        className={cn(
          'flex w-full items-center justify-between py-3 text-sm font-medium text-ar-silver transition-colors hover:text-ar-gold',
          className
        )}
        data-state={isOpen ? 'open' : 'closed'}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-ar-silver/50 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
    )
  }
)
AccordionTrigger.displayName = 'AccordionTrigger'

// ─── AccordionContent ───────────────────────────────────────────────────────

interface AccordionContentProps {
  className?: string
  children: React.ReactNode
}

const AccordionContent = ({ className, children }: AccordionContentProps) => {
  const { openItems } = React.useContext(AccordionContext)
  const value = React.useContext(ItemContext)
  const isOpen = openItems.includes(value)

  if (!isOpen) return null

  return (
    <div className={cn('pb-4 pt-0 text-sm text-ar-silver/80', className)}>
      {children}
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
