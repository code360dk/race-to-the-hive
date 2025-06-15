// Using the global Supabase client from the browser bundle
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

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