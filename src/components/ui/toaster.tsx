
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
  const { toast } = useToast()

  return (
    <>
      {/* Sonner toaster for the actual toast notifications */}
      <SonnerToaster position="bottom-right" />
      
      {/* This component is kept for compatibility with shadcn/ui */}
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    </>
  )
}
