/**
 * Validation runner script
 * Can be executed to validate the song database
 */

import { printValidationReport, getDatabaseSummary } from './databaseValidator.js';

// Run validation and print results
const runValidation = () => {
  console.log('🎵 Running Song Database Validation...\n');
  
  try {
    // Print detailed validation report
    printValidationReport();
    
    // Print database summary
    const summary = getDatabaseSummary();
    console.log('=== DATABASE SUMMARY ===');
    console.log(`📊 Genres: ${summary.genreCount} (${summary.genres.join(', ')})`);
    console.log(`📅 Decades: ${summary.decadeCount} (${summary.decades.join(', ')})`);
    console.log(`🎼 Total Sections: ${summary.totalSections}`);
    console.log(`📈 Average Sections per Song: ${summary.averageSectionsPerSong}`);
    console.log('=== END SUMMARY ===\n');
    
  } catch (error) {
    console.error('❌ Validation failed with error:', error.message);
    console.error(error.stack);
  }
};

// Export for use in other modules
export { runValidation };

// If running directly (not imported), execute validation
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  runValidation();
}

export default runValidation;