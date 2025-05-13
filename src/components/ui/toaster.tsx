
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <>
      {/* Sonner toaster for the actual toast notifications */}
      <SonnerToaster 
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          }
        }}
      />
      
      {/* This component is kept for compatibility with shadcn/ui */}
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    </>
  )
}
