#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const chokidar = require('chokidar');
const { parseFiles } = require('./lib/parser');
const { generateCss } = require('./lib/generator');

/**
 * @typedef {Object} CLIConfig
 * @property {string} output - Path to the output CSS file.
 * @property {string} config - Path to the tailwind.config.js file.
 * @property {boolean} watch - Whether to watch for file changes.
 * @property {string} [postCommand] - Command to execute after successful CSS generation.
 */

// --- Function for executing the main logic ---
/**
 * Runs the main logic of the CLI tool: parsing files, generating CSS, and writing to the output.
 * @param {CLIConfig} config - The configuration object from CLI arguments.
 */
async function run(config) {
  try {
    console.time('✨ Done in');
    // 1. Find all files from tailwind.config.js
    const tailwindConfigPath = path.resolve(process.cwd(), config.config);
    let tailwindConfig;
    try {
      // Attempt to load the config. Handle both CommonJS (module.exports) and ES Modules (export default)
      const loadedConfig = require(tailwindConfigPath);
      tailwindConfig = loadedConfig.default || loadedConfig;
    } catch (err) {
      console.error(`Error: Could not load tailwind.config.js from ${tailwindConfigPath}. Please ensure the path is correct and it's a CommonJS module (using module.exports) if not pre-transpiled.`);
      console.error(`Detailed error: ${err.message}`);
      process.exit(1);
    }

    // IMPORTANT: Add a robust check for tailwindConfig and its content property
    if (!tailwindConfig || typeof tailwindConfig.content === 'undefined') {
      console.error('Error: "content" property not found or invalid in tailwind.config.js. Please ensure your Tailwind CSS configuration is correct.');
      process.exit(1);
    }

    // The parseFiles function in lib/parser.js now handles empty/undefined content paths gracefully.
    const files = await parseFiles(tailwindConfig.content);
    
    // 2. Generate CSS
    const css = await generateCss(files, tailwindConfig);

    // 3. Write result to file
    await fs.writeFile(config.output, css);
    const generatedRulesCount = Object.keys(files).length;
    console.log(`Successfully generated ${generatedRulesCount} rule${generatedRulesCount === 1 ? '' : 's'} to ${config.output}`);
    console.timeEnd('✨ Done in');

    // --- Add post-processing command execution ---
    if (config.postCommand) {
      console.log(`Executing post-command: "${config.postCommand}"`);
      try {
        const { stdout, stderr } = await new Promise((resolve, reject) => {
          exec(config.postCommand, (error, stdout, stderr) => {
            if (error) {
              // If the command returned an error, but there is output, show it
              if (stdout) console.log(`Post-command stdout:\n${stdout}`);
              if (stderr) console.error(`Post-command stderr:\n${stderr}`);
              reject(new Error(`Post-command failed: ${error.message}`));
              return;
            }
            resolve({ stdout, stderr });
          });
        });
        if (stdout) console.log(`Post-command stdout:\n${stdout}`);
        if (stderr) console.error(`Post-command stderr:\n${stderr}`);
        console.log('Post-command executed successfully.');
      } catch (postCommandError) {
        console.error('Error executing post-command:', postCommandError.message);
        // Do not exit here so that the main tdb process still completes successfully
        // But you can add process.exit(1) if you want a post-command error to be critical
      }
    }

  } catch (error) {
    console.error('Error in tdb main process:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1); // Exit with error if main tdb logic failed
  }
}

// --- CLI Setup ---
const argv = yargs(hideBin(process.argv))
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Output CSS file path',
    default: './dynamic-breakpoints.css',
  })
  .option('config', {
    alias: 'c',
    type: 'string',
    description: 'Path to tailwind.config.js',
    default: 'tailwind.config.js',
  })
  .option('watch', {
    alias: 'w',
    type: 'boolean',
    description: 'Watch for file changes',
  })
  .option('post-command', { // <--- New option
    alias: 'p',
    type: 'string',
    description: 'Command to execute after successful CSS generation (e.g., "npx tailwindcss -i ./src/input.css -o ./src/output.css")',
  })
  .help()
  .argv;

// --- Run ---
run(argv);

if (argv.watch) {
  const tailwindConfigPath = path.resolve(process.cwd(), argv.config);
  let tailwindConfig;
  try {
    const loadedConfig = require(tailwindConfigPath);
    tailwindConfig = loadedConfig.default || loadedConfig;
  } catch (err) {
    console.error(`Error: Could not load tailwind.config.js for watch mode from ${tailwindConfigPath}. Please ensure the path is correct and it's a CommonJS module.`);
    console.error(`Detailed error for watch mode: ${err.message}`);
    process.exit(1);
  }

  if (!tailwindConfig || typeof tailwindConfig.content === 'undefined' || tailwindConfig.content.length === 0) {
    console.warn('Warning: No content paths specified in tailwind.config.js for watch mode. Watch mode will not track any files.');
  } else {
    console.log('👀 Watching for changes in:', tailwindConfig.content);
    chokidar.watch(tailwindConfig.content, { ignored: /(^|[\/\\])\../, persistent: true }).on('change', (filePath) => {
      console.log(`File changed: ${filePath}, regenerating...`);
      // Rerun 'run' with the same arguments
      run(argv);
    });
  }
}