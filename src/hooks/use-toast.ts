
import { toast as sonnerToast, type Toast } from "sonner";

const TOAST_TIMEOUT = 4000;

// Shadcn UI toast type definitions
type ToastProps = {
  title?: string;
  description?: string;
  duration?: number;
  variant?: "default" | "destructive" | "success" | "warning";
};

// Map shadcn variants to sonner variants
const mapVariant = (variant: ToastProps['variant'] = 'default') => {
  switch (variant) {
    case 'destructive':
      return 'error';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    default:
      return 'default';
  }
};

export function useToast() {
  return {
    toast: ({ title, description, variant, duration = TOAST_TIMEOUT }: ToastProps) => {
      // Map shadcn variant to sonner variant
      const sonnerVariant = mapVariant(variant);

      // Use sonner toast implementation
      if (sonnerVariant === 'error') {
        return sonnerToast.error(title, { description, duration });
      } else if (sonnerVariant === 'success') {
        return sonnerToast.success(title, { description, duration });
      } else if (sonnerVariant === 'warning') {
        return sonnerToast.warning(title, { description, duration });
      } else {
        return sonnerToast(title, { description, duration });
      }
    }
  };
}

// Re-export sonner toast for direct use
export { sonnerToast as toast };

// Types for component props
export type { ToastProps };
