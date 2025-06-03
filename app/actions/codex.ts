'use server'

import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

interface ElementInfo {
  component: string;
  file: string;
  line: number;
  element: string;
  position: string;
  size: string;
  classes: string;
}

interface ModificationRequest {
  userRequest: string;
  selectedElements: ElementInfo[];
}

interface DependencyGraph {
  [key: string]: string[];
}

interface CodingAgentThinkingStep {
  analysis: string;
  filesToModify: string[];
  dependentFiles: string[];
  reasoning: string;
  modificationPlan: string;
  codingAgentPrompt: string;
}

// Load and parse the dependency graph
async function loadDependencyGraph(): Promise<DependencyGraph> {
  try {
    const graphPath = path.join(process.cwd(), 'dependency-graph.json');
    const graphContent = await fs.readFile(graphPath, 'utf-8');
    return JSON.parse(graphContent);
  } catch (error) {
    console.warn('Could not load dependency graph:', error);
    return {};
  }
}

// Find all files that depend on a given file
function findDependentFiles(targetFile: string, dependencyGraph: DependencyGraph): string[] {
  const dependents: string[] = [];
  
  for (const [file, dependencies] of Object.entries(dependencyGraph)) {
    if (dependencies.includes(targetFile)) {
      dependents.push(file);
    }
  }
  
  return dependents;
}

// Find all files that a given file depends on
function findDependencies(targetFile: string, dependencyGraph: DependencyGraph): string[] {
  return dependencyGraph[targetFile] || [];
}

// THINKING STEP: Analyze what needs to be modified and format for Coding Agent
export async function analyzeForCodingAgent(request: ModificationRequest): Promise<CodingAgentThinkingStep> {
  console.log('🧠 Analyzing modification request for Coding Agent execution...');
  
  const { userRequest, selectedElements } = request;
  const dependencyGraph = await loadDependencyGraph();
  
  // Get unique files from selected elements
  const directFiles = [...new Set(selectedElements.map(el => el.file))];
  
  // Read content of all relevant files to provide complete context
  const fileContents: Record<string, string> = {};
  const allRelevantFiles = new Set(directFiles);
  
  // Add dependencies and dependents to get complete context
  for (const file of directFiles) {
    const dependencies = findDependencies(file, dependencyGraph);
    const dependents = findDependentFiles(file, dependencyGraph);
    
    dependencies.forEach(dep => allRelevantFiles.add(dep));
    dependents.forEach(dep => allRelevantFiles.add(dep));
  }
  
  // Read all relevant file contents
  for (const file of allRelevantFiles) {
    try {
      const fullPath = path.join(process.cwd(), file.startsWith('app/') || file.startsWith('components/') ? file : `app/${file}`);
      const content = await fs.readFile(fullPath, 'utf-8');
      fileContents[file] = content;
    } catch (error) {
      console.warn(`Could not read file ${file}:`, error);
      fileContents[file] = `// Could not read file: ${error}`;
    }
  }
  
  // Analyze dependencies for each file
  const analysisResults = directFiles.map(file => {
    const dependencies = findDependencies(file, dependencyGraph);
    const dependents = findDependentFiles(file, dependencyGraph);
    
    return {
      file,
      dependencies,
      dependents,
      hasSelectedElements: selectedElements.filter(el => el.file === file).length
    };
  });

  // Create the Coding Agent formatted prompt
  const codingAgentPrompt = `You are an expert React/Next.js developer and code analyst. I need you to analyze this modification request and then implement the necessary changes to the codebase.

## PROJECT CONTEXT
This is a Next.js application with the following structure:
- Uses TypeScript and React
- Has server actions in app/actions/
- Uses Tailwind CSS for styling
- Has a dependency graph system for tracking file relationships

## USER REQUEST
"${userRequest}"

## SELECTED ELEMENTS TO MODIFY
${selectedElements.map((el, i) => `${i + 1}. File: ${el.file}
   - Component: ${el.component}
   - Element: ${el.element} (Line ${el.line})
   - CSS Classes: ${el.classes}
   - Position: ${el.position}
   - Size: ${el.size}`).join('\n\n')}

## DEPENDENCY ANALYSIS
${analysisResults.map(result => 
  `### ${result.file}
- Selected elements: ${result.hasSelectedElements}
- Dependencies: ${result.dependencies.length > 0 ? result.dependencies.join(', ') : 'none'}
- Dependents: ${result.dependents.length > 0 ? result.dependents.join(', ') : 'none'}`
).join('\n\n')}

## COMPLETE FILE CONTENTS
${Object.entries(fileContents).map(([file, content]) => 
  `### ${file}
\`\`\`typescript
${content}
\`\`\``
).join('\n\n')}

## TASK
Please analyze this request and implement the necessary changes. Follow these steps:

1. **ANALYSIS**: Understand what changes are needed and why
2. **PLANNING**: Determine which files need modification and in what order
3. **IMPLEMENTATION**: Make the actual code changes using file editing tools
4. **VALIDATION**: Ensure the changes are consistent and don't break dependencies

## REQUIREMENTS
- Preserve all existing functionality
- Follow React/Next.js best practices
- Maintain TypeScript type safety
- Keep consistent code style and formatting
- Update any dependent files if necessary
- Test that the changes work as expected

Please start by analyzing the request and then proceed with the implementation.`;

  const analysis = `Analyzing ${directFiles.length} files with ${selectedElements.length} selected elements for Coding Agent execution`;
  
  const reasoning = `
Analysis of modification request: "${userRequest}"

Direct files with selected elements: ${directFiles.join(', ')}
All relevant files analyzed: ${Array.from(allRelevantFiles).join(', ')}

File Analysis:
${analysisResults.map(result => 
  `- ${result.file}: ${result.hasSelectedElements} selected elements
    Dependencies: ${result.dependencies.length > 0 ? result.dependencies.join(', ') : 'none'}
    Dependents: ${result.dependents.length > 0 ? result.dependents.join(', ') : 'none'}`
).join('\n')}

Coding Agent will receive complete context including:
- All file contents (${Object.keys(fileContents).length} files)
- Dependency relationships
- Selected element details
- Modification requirements
  `.trim();

  return {
    analysis,
    filesToModify: directFiles,
    dependentFiles: Array.from(allRelevantFiles).filter(f => !directFiles.includes(f)),
    reasoning,
    modificationPlan: `Coding Agent will analyze and implement changes for ${directFiles.length} files based on ${selectedElements.length} selected elements`,
    codingAgentPrompt
  };
}

// Execute Coding Agent with the thinking step analysis
export async function executeCodingAgentWithAnalysis(request: ModificationRequest): Promise<{
  success: boolean
  output: string
  error?: string
  sessionId?: string
  cost?: number
  duration?: number
  thinkingStep?: CodingAgentThinkingStep
}> {
  console.log('🚀 Starting Coding Agent execution with analysis...');
  
  try {
    // Step 1: Analyze the modification request
    const thinkingStep = await analyzeForCodingAgent(request);
    console.log('📊 Analysis completed:', thinkingStep.analysis);
    

    console.log('🚀 Thinking step:', thinkingStep);
    // Step 2: Execute Coding Agent with the formatted prompt
    const result = await executeCodingAgent(thinkingStep.codingAgentPrompt);
    
    return {
      ...result,
      thinkingStep
    };
    
  } catch (error) {
    console.error('Error in Coding Agent execution with analysis:', error);
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error in analysis'
    };
  }
}

export async function executeCodingAgent(prompt: string): Promise<{
  success: boolean
  output: string
  error?: string
  sessionId?: string
  cost?: number
  duration?: number
}> {
  console.log('🚀 Starting Coding Agent execution with prompt length:', prompt.length)
  
  // Validate and sanitize the prompt
  if (!prompt || prompt.trim().length === 0) {
    return {
      success: false,
      output: '',
      error: 'Empty prompt provided'
    }
  }
  
  const sanitizedPrompt = prompt.trim()
  console.log('🧹 Sanitized prompt length:', sanitizedPrompt.length)
  
  return new Promise((resolve) => {
    let isResolved = false
    
    // Use stdin approach - no prompt in args, just the flags
    const args = ['-p', '--output-format', 'json']
    console.log('📝 Spawning claude process with stdin approach')
    
    const claudeProcess = spawn('claude', args, {
      shell: false, // Don't use shell to avoid escaping issues
      env: {
        ...process.env
      },
      stdio: ['pipe', 'pipe', 'pipe']
    })

    console.log('✅ Coding Agent process spawned with PID:', claudeProcess.pid)

    // Write the prompt to stdin
    if (claudeProcess.stdin) {
      claudeProcess.stdin.write(sanitizedPrompt)
      claudeProcess.stdin.end()
      console.log('📝 Wrote prompt to stdin and closed')
    } else {
      console.error('❌ Failed to get stdin handle')
      isResolved = true
      resolve({
        success: false,
        output: '',
        error: 'Failed to get stdin handle'
      })
      return
    }

    let stdout = ''
    let stderr = ''

    claudeProcess.stdout?.on('data', (data) => {
      const chunk = data.toString()
      console.log('📤 STDOUT chunk received (length:', chunk.length, ')')
      stdout += chunk
    })

    claudeProcess.stderr?.on('data', (data) => {
      const chunk = data.toString()
      console.log('❌ STDERR chunk received:', chunk)
      stderr += chunk
    })

    claudeProcess.on('close', (code) => {
      if (isResolved) return
      isResolved = true
      
      console.log('🏁 Process closed with code:', code)
      console.log('📊 Final stdout length:', stdout.length)
      console.log('📊 Final stderr length:', stderr.length)
      
      if (code === 0) {
        console.log('✅ Resolving with success')
        
        try {
          const jsonResponse = JSON.parse(stdout)
          console.log('📋 Parsed JSON response keys:', Object.keys(jsonResponse))
          
          resolve({
            success: true,
            output: jsonResponse.result || stdout,
            sessionId: jsonResponse.session_id,
            cost: jsonResponse.cost_usd,
            duration: jsonResponse.duration_ms
          })
        } catch (parseError) {
          console.log('⚠️ Failed to parse JSON, returning raw output')
          resolve({
            success: true,
            output: stdout || 'Coding Agent execution completed'
          })
        }
      } else {
        console.log('❌ Resolving with error')
        resolve({
          success: false,
          output: stdout,
          error: stderr || `Process exited with code ${code}`
        })
      }
    })

    claudeProcess.on('error', (error) => {
      if (isResolved) return
      isResolved = true
      
      console.log('💥 Process error occurred:', error.message)
      resolve({
        success: false,
        output: '',
        error: error.message
      })
    })

    claudeProcess.on('exit', (code, signal) => {
      if (isResolved) return
      isResolved = true
      
      console.log('🚪 Process exited with code:', code, 'signal:', signal)
      
      if (signal === 'SIGTERM') {
        resolve({
          success: false,
          output: stdout,
          error: 'Process was terminated'
        })
      } else if (code !== 0) {
        resolve({
          success: false,
          output: stdout,
          error: stderr || `Process exited with code ${code}`
        })
      }
    })

    console.log('⏳ Waiting for coding agent process to complete...')
  })
}

export async function testCodingAgent(): Promise<{
  success: boolean
  output: string
  error?: string
}> {
  console.log('🧪 Testing Coding Agent with simple prompt...')
  
  const testPrompt = "Hello, this is a test. Please respond with 'Test successful!'"
  
  try {
    const result = await executeCodingAgent(testPrompt)
    console.log('🧪 Test result:', result)
    return result
  } catch (error) {
    console.error('🧪 Test failed:', error)
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Unknown test error'
    }
  }
}
