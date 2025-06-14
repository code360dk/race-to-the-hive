// Using the global Supabase client from the browser bundle
const supabaseUrl = 'https://hiajbvvxhoupmaspuprn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWpidnZ4aG91cG1hc3B1cHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDA0NDIsImV4cCI6MjA2NTA3NjQ0Mn0.j43SsaOePTcrcnAfU2sQ7JUrNUKHBdfWhsML8QJjrNw';

// Create the Supabase client using the global supabase object
export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Test the connection
supabase
    .from('scores')
    .select('count(*)', { count: 'exact' })
    .then(({ count, error }) => {
        if (error) {
            console.error('Error connecting to Supabase:', error.message);
        } else {
            console.log('Successfully connected to Supabase! Number of scores:', count);
        }
    }); 