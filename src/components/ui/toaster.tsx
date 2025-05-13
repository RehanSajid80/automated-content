
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <>
      {/* Use Sonner's Toaster for actual toast rendering */}
      <SonnerToaster />
      
      {/* Keep the shadcn/ui toasts for compatibility with existing code */}
      <ToastProvider>
        {toasts.map(function ({ id, title, description, action, variant, ...props }) {
          // Only pass allowed variants to the shadcn Toast component
          // Convert success and warning to default for shadcn compatibility
          const mappedVariant = variant === "success" || variant === "warning" 
            ? "default" 
            : variant === "destructive" ? "destructive" : "default";
            
          return (
            <Toast key={id} variant={mappedVariant} {...props}>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </Toast>
          )
        })}
        <ToastViewport />
      </ToastProvider>
    </>
  )
}
