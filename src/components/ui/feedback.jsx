import { forwardRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './button'

/* ---------------------------------- Badge ---------------------------------- */

const BADGES = {
  default: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
}

export function Badge({ variant = 'default', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
        BADGES[variant] || BADGES.default,
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ---------------------------------- Dialog --------------------------------- */

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger

export function DialogContent({ className, children, title, description, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[min(94vw,560px)] max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2',
          'panel bg-slate-900 p-6 shadow-2xl animate-fade-in',
          className,
        )}
        {...props}
      >
        {(title || description) && (
          <div className="mb-5 pr-8">
            {title && <DialogPrimitive.Title className="text-xl font-bold text-white">{title}</DialogPrimitive.Title>}
            {description && (
              <DialogPrimitive.Description className="text-sm text-slate-400 mt-1">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
        )}
        {children}
        <DialogPrimitive.Close asChild>
          <button
            className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6', className)} {...props} />
}

export function DialogCancel({ children = 'Cancel', ...props }) {
  return (
    <DialogPrimitive.Close asChild>
      <Button variant="outline" {...props}>
        {children}
      </Button>
    </DialogPrimitive.Close>
  )
}

/* ---------------------------------- Tabs ----------------------------------- */

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex h-10 items-center justify-center rounded-xl bg-slate-800/50 p-1', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400',
        'transition-all hover:text-white data-[state=active]:text-white data-[state=active]:bg-slate-700/60',
        'focus-visible:outline-none',
        className,
      )}
      {...props}
    />
  )
}

export const TabsContent = TabsPrimitive.Content

/* ---------------------------------- Table ---------------------------------- */

export function TableWrap({ className, ...props }) {
  return <div className={cn('overflow-x-auto', className)} {...props} />
}

export function Table({ className, ...props }) {
  return <table className={cn('w-full text-sm', className)} {...props} />
}

export function Th({ className, ...props }) {
  return (
    <th
      className={cn(
        'text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 whitespace-nowrap',
        className,
      )}
      {...props}
    />
  )
}

export function Td({ className, ...props }) {
  return <td className={cn('px-4 py-4 text-slate-300 whitespace-nowrap', className)} {...props} />
}

/* -------------------------------- EmptyState ------------------------------- */

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('text-center py-16 px-6', className)}>
      {Icon && <Icon className="w-16 h-16 text-slate-600 mx-auto mb-4" />}
      <p className="text-lg text-slate-400">{title}</p>
      {description && <p className="text-sm text-slate-500 mt-2">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}
