
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [functionExists, setFunctionExists] = useState(false);

  const checkIfFunctionExists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to call the function directly to check if it exists
      try {
        const { data, error } = await supabase
          .rpc('exec_sql', { 
            sql: `SELECT public.is_admin('${user.id}') as is_admin` 
          });
        
        if (!error && data) {
          setFunctionExists(true);
          // Type check and extract the result
          const result = data as any;
          if (result && typeof result.is_admin === 'boolean') {
            setIsAdmin(result.is_admin);
          }
        } else {
          setFunctionExists(false);
        }
      } catch (error) {
        setFunctionExists(false);
      }
    } catch (error) {
      setFunctionExists(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Try to check if function exists and call it
      try {
        const { data: adminData, error } = await supabase
          .rpc('exec_sql', { 
            sql: `SELECT public.is_admin('${user.id}') as is_admin` 
          });
        
        if (!error && adminData) {
          // Type check and extract the result
          const result = adminData as any;
          if (result && typeof result.is_admin === 'boolean') {
            setIsAdmin(result.is_admin);
            setFunctionExists(true);
          } else {
            setIsAdmin(false);
            setFunctionExists(false);
          }
        } else {
          setIsAdmin(false);
          setFunctionExists(false);
        }
      } catch (error) {
        console.log("is_admin function not available");
        setIsAdmin(false);
        setFunctionExists(false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
    checkIfFunctionExists();
  }, []);

  return {
    isAdmin,
    functionExists,
    checkAdminStatus,
    checkIfFunctionExists
  };
};
