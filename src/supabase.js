import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yvlfbhypvwszwugkldjs.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bGZiaHlwdndzend1Z2tsZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODk1MTYsImV4cCI6MjA4ODQ2NTUxNn0.rRf08syNle34Cn-l1WFVNHzZhRXXK1f80tYVfg9Pig8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
