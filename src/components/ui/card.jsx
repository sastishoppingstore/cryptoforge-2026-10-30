import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Card = forwardRef(function Card({ className, ...props }, ref) {
  return <div ref={ref} className={cn('panel', className)} {...props} />
})

export const CardHeader = forwardRef(function CardHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn('p-5 sm:p-6 pb-0', className)} {...props} />
})

export const CardTitle = forwardRef(function CardTitle({ className, ...props }, ref) {
  return <h3 ref={ref} className={cn('text-lg font-bold text-white', className)} {...props} />
})

export const CardDescription = forwardRef(function CardDescription({ className, ...props }, ref) {
  return <p ref={ref} className={cn('text-sm text-slate-400 mt-1', className)} {...props} />
})

export const CardContent = forwardRef(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn('p-5 sm:p-6', className)} {...props} />
})

export const CardFooter = forwardRef(function CardFooter({ className, ...props }, ref) {
  return <div ref={ref} className={cn('p-5 sm:p-6 pt-0 flex items-center', className)} {...props} />
})
