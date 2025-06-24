
import { supabase } from "@/integrations/supabase/client";

export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }

    // Try to call is_admin function using exec_sql if it exists
    try {
      const { data, error } = await supabase
        .rpc('exec_sql', { 
          sql: `SELECT public.is_admin('${user.id}') as is_admin` 
        });
      
      if (!error && data) {
        // Type check and extract the result
        const result = data as any;
        if (result && typeof result.is_admin === 'boolean') {
          return result.is_admin;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.log("is_admin function not available, defaulting to false");
      return false;
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};
