
import * as React from "react";
import { toast as sonnerToast, type ToasterProps } from "sonner";

// Define our internal ToastProps interface
export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning";
  action?: React.ReactNode;
  duration?: number;
}

// Create internal toast state 
type ToastStateType = {
  id: string | number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning";
  action?: React.ReactNode;
  duration?: number;
  [key: string]: any;
}

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastStateType;

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = {
  type: string;
  toast?: ToasterToast;
  toastId?: ToasterToast["id"];
};

const toastTimeouts = new Map<string | number, ReturnType<typeof setTimeout>>();

function reducer(state: ToasterToast[], action: ActionType): ToasterToast[] {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return [action.toast!, ...state].slice(0, TOAST_LIMIT);

    case actionTypes.UPDATE_TOAST:
      return state.map((t) => t.id === action.toastId ? { ...t, ...action.toast } : t);

    case actionTypes.DISMISS_TOAST:
      return state.map((t) => t.id === action.toastId ? { ...t, dismissed: true } : t);

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return [];
      }
      return state.filter((t) => t.id !== action.toastId);

    default:
      return state;
  }
}

const listeners: Array<(state: ToasterToast[]) => void> = [];

let memoryState: ToasterToast[] = [];

function dispatch(action: ActionType) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

function toast({ title, description, variant = "default", action, duration }: ToastProps) {
  // For sonner toast
  const options: Record<string, any> = {
    duration: duration || 5000,
    className: variant === "destructive" 
      ? "bg-destructive text-destructive-foreground"
      : variant === "success"
      ? "bg-green-500 text-white"
      : variant === "warning"
      ? "bg-amber-500 text-white"
      : undefined
  };
  
  // Add action to options if provided
  if (action) {
    options.action = action;
  }

  let toastId;
  
  // Use sonner toast
  if (variant === "success" || variant === "warning") {
    // Sonner has native support for these variants
    toastId = variant === "success" 
      ? sonnerToast.success(title as string, { description, ...options })
      : sonnerToast.warning(title as string, { description, ...options });
  } else if (variant === "destructive") {
    toastId = sonnerToast.error(title as string, { description, ...options });
  } else {
    toastId = sonnerToast(title as string, { description, ...options });
  }
  
  // Also add to our internal state for shadcn/ui toast system
  const id = genId();
  
  const internalToast = {
    id,
    title,
    description,
    variant,
    duration: duration || 5000,
    action
  };
  
  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: internalToast,
  });

  return toastId;
}

function useToast() {
  const [state, setState] = React.useState<ToasterToast[]>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    toast,
    toasts: state,
    dismiss: (toastId: string | number) => {
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId });
    },
  };
}

export { useToast, toast };
