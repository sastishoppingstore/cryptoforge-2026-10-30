import { forwardRef } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '../../lib/utils'

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full h-11 rounded-xl bg-slate-800/60 border border-slate-700 px-4 text-sm text-white',
        'placeholder:text-slate-500 transition-colors',
        'focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20',
        'disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
})

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-xl bg-slate-800/60 border border-slate-700 p-4 text-sm text-white',
        'placeholder:text-slate-500 transition-colors resize-y min-h-[110px]',
        'focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20',
        className,
      )}
      {...props}
    />
  )
})

export const Label = forwardRef(function Label({ className, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn('block text-sm font-medium text-slate-300 mb-2', className)}
      {...props}
    />
  )
})

export const Separator = forwardRef(function Separator({ className, orientation = 'horizontal', ...props }, ref) {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative
      orientation={orientation}
      className={cn('bg-slate-700/60 shrink-0', orientation === 'vertical' ? 'w-px h-full' : 'h-px w-full', className)}
      {...props}
    />
  )
})

export const Progress = forwardRef(function Progress({ className, value = 0, ...props }, ref) {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-slate-700/60', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-transform"
        style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})

export const Switch = forwardRef(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
        'data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  )
})

export function Avatar({ name, className }) {
  const label = String(name || 'U')
  const initial = label.includes('@') ? label[0].toUpperCase() : label.charAt(0).toUpperCase()
  return (
    <AvatarPrimitive.Root
      className={cn(
        'inline-flex h-10 w-10 select-none items-center justify-center overflow-hidden rounded-full grad-btn on-accent font-semibold',
        className,
      )}
    >
      <AvatarPrimitive.Fallback className="on-accent text-sm">{initial}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

export function Spinner({ className }) {
  return (
    <span
      className={cn('inline-block h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent', className)}
    />
  )
}
