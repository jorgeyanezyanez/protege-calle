import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zautcelntdkqmocdrdzw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphdXRjZWxudGRrcW1vY2RyZHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDA3NTYsImV4cCI6MjA5NDE3Njc1Nn0.eXZf33g8gLDVBX-3HtX-CFZSqhlbdGqXd-TKDjLR5pE";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);