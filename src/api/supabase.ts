import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase URL and key from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL || 'https://oflqkfyqbhckiawnizeq.supabase.co';
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbHFrZnlxYmhja2lhd25pemVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NDc2ODcsImV4cCI6MjA1NzIyMzY4N30.7FClTLEELEZAqiMs2ME45DMOlSf7TCGvMBdS4EYS04w';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
