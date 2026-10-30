import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/utils'

const VARIANTS = {
  default: 'grad-btn on-accent shadow-lg shadow-cyan-500/10',
  secondary: 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700',
  outline: 'border border-slate-700 bg-transparent text-white hover:bg-slate-800/60',
  ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60',
  destructive: 'bg-red-500/90 text-white hover:bg-red-500',
  success: 'bg-emerald-500/90 on-accent hover:bg-emerald-500',
  link: 'bg-transparent text-cyan-400 hover:underline underline-offset-4 p-0 h-auto',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-12 px-7 text-base rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
}

export const Button = forwardRef(function Button(
  { className, variant = 'default', size = 'md', asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  )
})
