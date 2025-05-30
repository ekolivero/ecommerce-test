import madge from 'madge';
import fs from 'fs';

// Simple configuration
const CONFIG = {
  sourceDir: process.env.ANALYZE_DIR || './app',
  outputFile: process.env.DEPS_OUTPUT || 'dependency-graph.json',
  fileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  tsConfigPath: './tsconfig.json'
};

async function generateDependencyGraph() {
  try {
    console.log('🔍 Analyzing dependencies in:', CONFIG.sourceDir);
    
    // Analyze the project with madge
    const result = await madge(CONFIG.sourceDir, {
      fileExtensions: CONFIG.fileExtensions,
      tsConfig: CONFIG.tsConfigPath,
      includeNpm: false
    });

    // Get the dependency object
    const dependencyGraph = result.obj();
    
    // Save to JSON file
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(dependencyGraph, null, 2));
    
    console.log('✅ Dependency graph saved to:', CONFIG.outputFile);
    console.log('📊 Total files analyzed:', Object.keys(dependencyGraph).length);
    
    return dependencyGraph;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDependencyGraph().catch(console.error);
}

export { generateDependencyGraph, CONFIG };