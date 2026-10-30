import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '../../lib/utils'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export function DropdownMenuContent({ className, align = 'end', sideOffset = 8, ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-[70] min-w-[220px] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl animate-fade-in',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuItem({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none',
        'data-[highlighted]:bg-slate-800 data-[highlighted]:text-white',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuLabel({ className, ...props }) {
  return <DropdownMenuPrimitive.Label className={cn('px-3 py-2 text-xs uppercase tracking-wider text-slate-500', className)} {...props} />
}

export function DropdownMenuSeparator({ className, ...props }) {
  return <DropdownMenuPrimitive.Separator className={cn('my-1 h-px bg-slate-700/60', className)} {...props} />
}
