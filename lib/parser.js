const fs = require('fs/promises');
const glob = require('glob'); // Make sure 'glob' is installed as a dependency in your library

// Regular expression for finding classes like: media-max-1209:text-black
const DYNAMIC_CLASS_REGEX = /media-(max|min)-(\d+):([\w\d\-\/\[\]\.\%]+)/g;

/**
 * Parses files specified by glob patterns to find dynamic breakpoint classes.
 * @param {string|string[]} contentGlobs - Glob pattern(s) for files to scan.
 * @returns {Promise<Object.<string, {type: string, value: string, utilityClass: string}>>} An object mapping full class strings to their parsed components.
 */
async function parseFiles(contentGlobs) {
  // Add robust checks for contentGlobs to prevent errors
  if (!contentGlobs || (Array.isArray(contentGlobs) && contentGlobs.length === 0)) {
    console.warn('Warning: No content paths specified in tailwind.config.js. No files will be scanned for dynamic breakpoints.');
    return {}; // Return an empty object if no content paths are provided
  }

  // Ensure contentGlobs is always an array, as glob.glob expects an array or a single string
  const globsArray = Array.isArray(contentGlobs) ? contentGlobs : [contentGlobs];

  const allFilePaths = await glob.glob(globsArray, { nodir: true });
  const allMatches = {};

  for (const filePath of allFilePaths) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      let match;
      // Reset regex lastIndex for each file to ensure all matches are found
      DYNAMIC_CLASS_REGEX.lastIndex = 0; 
      while ((match = DYNAMIC_CLASS_REGEX.exec(content)) !== null) {
        const [fullMatch, type, value, utilityClass] = match;
        // Store only unique fullMatch classes
        if (!allMatches[fullMatch]) {
          allMatches[fullMatch] = { type, value, utilityClass };
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}. Skipping. Error: ${error.message}`);
    }
  }

  return allMatches;
}

module.exports = { parseFiles };