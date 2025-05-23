
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rpgpykuxdsxiuoowolma.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZ3B5a3V4ZHN4aXVvb3dvbG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MjAyNzEsImV4cCI6MjA2MzQ5NjI3MX0.ZnFTJGhZlEyT2GKb1xwtmY5317VXOu1kPgSWpPKUx8w'; 

export const supabase = createClient(supabaseUrl, supabaseKey);
