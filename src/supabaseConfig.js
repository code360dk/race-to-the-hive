// Import configuration
import { config } from './config.js';

// Create the Supabase client using the global supabase object
export const supabase = window.supabase.createClient(config.supabase.url, config.supabase.anonKey);

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