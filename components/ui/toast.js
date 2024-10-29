import * as React from "react"



import * as ToastPrimitives from "@radix-ui/react-toast"



import { cva } from "class-variance-authority"



import { X } from "lucide-react"



import { cn } from "@/lib/utils"







export const ToastProvider = ToastPrimitives.Provider



export const ToastViewport = ToastPrimitives.Viewport







export const Toast = React.forwardRef(({ className, ...props }, ref) => (



  <ToastPrimitives.Root



    ref={ref}



    className={cn("group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all", className)}



    {...props}



  />



))



Toast.displayName = ToastPrimitives.Root.displayName







export const ToastClose = React.forwardRef(({ className, ...props }, ref) => (



  <ToastPrimitives.Close



    ref={ref}



    className={cn("absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100", className)}



    toast-close=""



    {...props}



  >



    <X className="h-4 w-4" />



  </ToastPrimitives.Close>



))



ToastClose.displayName = ToastPrimitives.Close.displayName







export const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (



  <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />



))



ToastTitle.displayName = ToastPrimitives.Title.displayName







export const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (



  <ToastPrimitives.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props} />



))



ToastDescription.displayName = ToastPrimitives.Description.displayName







export function useToast() {



  const [toasts, setToasts] = React.useState([])







  function toast({ title, description, action, ...props }) {



    setToasts((toasts) => {



      return [...toasts, { id: Math.random().toString(), title, description, action, ...props }]



    })



  }







  function dismiss(toastId) {



    setToasts((toasts) => toasts.filter((toast) => toast.id !== toastId))



  }







  return {



    toast,



    dismiss,



    toasts,



  }



}














