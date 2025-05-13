
import { toast as sonnerToast } from "sonner";
import { type ToastProps as SonnerToastProps } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  action?: React.ReactNode;
  duration?: number;
};

export function toast({
  title,
  description,
  variant = "default",
  action,
  duration,
}: ToastProps) {
  const options: SonnerToastProps = {
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

  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      ...options
    });
  }
  
  if (variant === "success") {
    return sonnerToast.success(title, {
      description,
      ...options
    });
  }

  return sonnerToast(title, {
    description,
    ...options
  });
}

export function useToast() {
  return { toast };
}
