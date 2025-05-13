
import { toast as sonnerToast } from "sonner";
import { type ToasterProps } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  action?: React.ReactNode;
  duration?: number;
};

// Interface for tracking active toasts
export interface Toast extends ToastProps {
  id: string | number;
}

// State to track all active toasts
const toasts: Toast[] = [];

export function toast({
  title,
  description,
  variant = "default",
  action,
  duration,
}: ToastProps) {
  const options: Partial<ToasterProps> = {
    duration: duration || 5000,
    className: variant === "destructive" 
      ? "bg-destructive text-destructive-foreground"
      : variant === "success"
      ? "bg-green-500 text-white"
      : variant === "warning"
      ? "bg-amber-500 text-white"
      : undefined,
    action
  };

  let toastId;

  if (variant === "destructive") {
    toastId = sonnerToast.error(title, {
      description,
      ...options
    });
  } else if (variant === "success") {
    toastId = sonnerToast.success(title, {
      description,
      ...options
    });
  } else {
    toastId = sonnerToast(title, {
      description,
      ...options
    });
  }

  // Track the toast in our internal state
  toasts.push({
    id: toastId,
    title,
    description,
    variant,
    action,
    duration
  });

  return toastId;
}

export function useToast() {
  return { 
    toast,
    toasts // Expose toasts array for Toaster component
  };
}
