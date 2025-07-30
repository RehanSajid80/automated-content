-- Fix security warnings by setting proper search paths for functions

-- Update the existing update_updated_at_column function with proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update the exec_sql function with proper search path
CREATE OR REPLACE FUNCTION public.exec_sql(sql text, params jsonb DEFAULT '[]'::jsonb)
RETURNS jsonb
SECURITY DEFINER  
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
  query_text TEXT;
BEGIN
  -- This is a simplified version for basic queries
  -- In production, you'd want more sophisticated parameter handling
  query_text := sql;
  
  -- Execute the query and return results as JSONB
  EXECUTE query_text INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;