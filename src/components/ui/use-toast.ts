
import { useToast as useToastHook } from "@/hooks/use-toast";

export const useToast = useToastHook;
export const toast = useToastHook().toast;
