"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import { cn } from "@/lib/utils"

function AlertDialog(props: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root {...props} />
}

function AlertDialogTrigger(props: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger {...props} />
}

const AlertDialogBackdrop = React.forwardRef<
  HTMLDivElement,
  AlertDialogPrimitive.Backdrop.Props
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Backdrop
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-200",
      className
    )}
    {...props}
  />
))
AlertDialogBackdrop.displayName = "AlertDialogBackdrop"

const AlertDialogPopup = React.forwardRef<
  HTMLDivElement,
  AlertDialogPrimitive.Popup.Props
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Popup
    ref={ref}
    className={cn(
      "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0f1117] p-6 shadow-xl data-[ending-style]:opacity-0 data-[ending-style]:scale-95 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 transition-all duration-200",
      className
    )}
    {...props}
  />
))
AlertDialogPopup.displayName = "AlertDialogPopup"

function AlertDialogPortal(props: AlertDialogPrimitive.Portal.Props) {
  return <AlertDialogPrimitive.Portal {...props} />
}

const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  AlertDialogPrimitive.Title.Props
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDialogPrimitive.Description.Props
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground mt-2", className)}
    {...props}
  />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogClose = React.forwardRef<
  HTMLButtonElement,
  AlertDialogPrimitive.Close.Props
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Close ref={ref} className={className} {...props} />
))
AlertDialogClose.displayName = "AlertDialogClose"

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2", className)} {...props} />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex justify-end gap-2 mt-6", className)}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogBackdrop,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
  AlertDialogHeader,
  AlertDialogFooter,
}
