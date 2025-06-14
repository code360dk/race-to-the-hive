import { supabase } from './supabaseConfig.js';

// Test score submission
async function testSupabaseIntegration() {
    console.log('Testing Supabase integration...');

    try {
        // Test 1: Insert a test score
        const testScore = {
            player_name: 'Test Player',
            email: 'test@example.com',
            score: 100
        };

        const { data: insertData, error: insertError } = await supabase
            .from('scores')
            .insert([testScore]);

        if (insertError) {
            throw insertError;
        }
        console.log('✅ Score insertion successful');

        // Test 2: Fetch leaderboard
        const { data: leaderboardData, error: leaderboardError } = await supabase
            .from('scores')
            .select('*')
            .order('score', { ascending: false })
            .limit(10);

        if (leaderboardError) {
            throw leaderboardError;
        }
        console.log('✅ Leaderboard fetch successful');
        console.log('Current leaderboard:', leaderboardData);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testSupabaseIntegration(); 