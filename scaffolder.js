/**
 * Spring Boot Scaffolder
 *
 * Handles downloading and extracting Spring Boot projects from start.spring.io.
 * This scaffolder is specific to the code-spring module.
 *
 * @module code-spring/scaffolder
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Lazy-load AdmZip to avoid requiring it if not needed
let AdmZip;

/**
 * Builds Spring Initializr URL with query parameters
 */
function buildSpringInitializrUrl(options) {
  const {
    groupId,
    artifactId,
    packageName,
    type = 'gradle-project',
    javaVersion = '21',
    platformVersion = '3.5.3',
    packaging = 'jar',
    dependencies = 'web',
    description = 'Spring Boot project'
  } = options;

  const params = new URLSearchParams({
    type,
    language: 'java',
    platformVersion,
    packaging,
    javaVersion,
    groupId,
    artifactId,
    name: artifactId,
    description,
    packageName,
    dependencies
  });

  return `https://start.spring.io/starter.zip?${params.toString()}`;
}

/**
 * Downloads Spring Boot starter.zip from start.spring.io
 */
function downloadSpringBootZip(url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`🌐 Downloading Spring Boot project from: ${url}`);

    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Spring Initializr request failed with status: ${res.statusCode}`));
      }

      const zipFile = fs.createWriteStream(outputPath);

      res.pipe(zipFile);

      zipFile.on('finish', () => {
        zipFile.close();
        console.log(`📦 Downloaded Spring Boot project to ${outputPath}`);
        resolve(outputPath);
      });

      zipFile.on('error', (err) => {
        fs.unlinkSync(outputPath);
        reject(err);
      });
    }).on('error', (err) => {
      reject(new Error(`Failed to download Spring Boot project: ${err.message}`));
    });
  });
}

/**
 * Extracts zip file and reads all files into memory
 */
async function extractZipToMemory(zipPath, extractPath) {
  // Lazy-load AdmZip
  if (!AdmZip) {
    try {
      AdmZip = require('adm-zip');
    } catch (e) {
      throw new Error('adm-zip package is required for Spring Boot project generation. Please install it with: npm install adm-zip');
    }
  }

  console.log(`📂 Extracting Spring Boot project...`);

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);

  // Read all extracted files into memory
  const files = {};

  function readDirectoryRecursive(dirPath, basePath = '') {
    if (!fs.existsSync(dirPath)) return;

    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      const relativePath = basePath ? path.join(basePath, item.name) : item.name;

      if (item.isDirectory()) {
        readDirectoryRecursive(fullPath, relativePath);
      } else {
        try {
          // Check if file is binary or text
          const isBinary = /\.(jar|class|png|jpg|jpeg|gif|ico|zip|gz|tar|war|ear)$/i.test(item.name);

          // Check if file should be executable
          // - gradlew and gradlew.bat
          // - Shell scripts (*.sh)
          const shouldBeExecutable = /^(gradlew|gradlew\.bat|.*\.sh)$/i.test(item.name);

          if (isBinary) {
            // Read binary files as base64 to preserve them in memory
            files[relativePath] = {
              type: 'binary',
              content: fs.readFileSync(fullPath, 'base64'),
              executable: shouldBeExecutable
            };
          } else {
            // Read text files as UTF-8
            files[relativePath] = {
              type: 'text',
              content: fs.readFileSync(fullPath, 'utf8'),
              executable: shouldBeExecutable
            };
          }
        } catch (err) {
          console.warn(`⚠️ Could not read file ${relativePath}: ${err.message}`);
        }
      }
    }
  }

  readDirectoryRecursive(extractPath);

  console.log(`✅ Extracted ${Object.keys(files).length} files from Spring Boot project`);

  return files;
}

/**
 * Removes files from the files object based on removal list
 */
function removeFiles(files, filesToRemove) {
  if (!filesToRemove || filesToRemove.length === 0) {
    return files;
  }

  console.log('🗑️ Removing files as specified in module configuration...');

  for (const fileToRemove of filesToRemove) {
    if (files[fileToRemove]) {
      delete files[fileToRemove];
      console.log(`✅ Removed file: ${fileToRemove}`);
    } else {
      console.warn(`⚠️ File not found for removal: ${fileToRemove}`);
    }
  }

  return files;
}

/**
 * Main scaffolding function - called by Genesis3
 *
 * @param {Object} moduleConfig - Module meta.json configuration
 * @param {Object} context - Scaffolding context
 * @param {Object} context.project - Project information
 * @param {Object} context.module - Module instance with fieldValues
 * @param {Array} context.modules - All modules in the project
 * @returns {Promise<Object>} Files object with {type, content} structure
 */
async function scaffold(moduleConfig, context) {
  const baseTemplateConfig = moduleConfig.generation?.baseTemplate?.config || {};
  const { project, module } = context;

  // Get Spring Boot configuration from module field values
  const fieldValues = module.fieldValues || {};

  // Build Java package name from domain
  const domainParts = project.domain.split('.').map(part => part.replace(/[^a-zA-Z0-9]/g, ''));
  const reversedDomain = [...domainParts].reverse().join('.');
  const moduleName = module.name.replace(/[^a-zA-Z0-9]/g, '');

  const groupId = reversedDomain;
  const artifactId = `${module.name}-api`;
  const packageName = `${groupId}.${moduleName}`;

  // Determine build tool type
  const buildTool = fieldValues.buildTool || baseTemplateConfig.build || 'gradle';
  const projectType = buildTool === 'maven' ? 'maven-project' : 'gradle-project';

  // Build Spring Initializr URL
  const url = buildSpringInitializrUrl({
    groupId,
    artifactId,
    packageName,
    type: projectType,
    javaVersion: fieldValues.javaVersion || baseTemplateConfig.javaVersion || '21',
    platformVersion: fieldValues.springBootVersion || baseTemplateConfig.platformVersion || '3.5.3',
    packaging: fieldValues.packaging || baseTemplateConfig.packaging || 'jar',
    dependencies: fieldValues.dependencies || baseTemplateConfig.dependencies || 'web,lombok',
    description: `Spring Boot project for ${module.name}`
  });

  console.log('🔍 Spring Boot parameters:', {
    groupId,
    artifactId,
    packageName,
    type: projectType,
    javaVersion: fieldValues.javaVersion || baseTemplateConfig.javaVersion || '21',
    platformVersion: fieldValues.springBootVersion || baseTemplateConfig.platformVersion || '3.5.3',
    packaging: fieldValues.packaging || baseTemplateConfig.packaging || 'jar'
  });

  // Create temporary directory for download
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genesis3-spring-'));
  const zipPath = path.join(tempDir, 'starter.zip');
  const extractPath = path.join(tempDir, 'extracted');

  try {
    // Download Spring Boot project
    await downloadSpringBootZip(url, zipPath);

    // Extract to memory
    fs.mkdirSync(extractPath, { recursive: true });
    const files = await extractZipToMemory(zipPath, extractPath);

    // Remove files specified in module configuration
    const filesToRemove = moduleConfig.generation?.files?.remove || [];
    const cleanedFiles = removeFiles(files, filesToRemove);

    console.log(`✅ Spring Boot project generated successfully (${Object.keys(cleanedFiles).length} files)`);

    return cleanedFiles;

  } finally {
    // Clean up temporary directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.warn(`⚠️ Could not clean up temporary directory ${tempDir}: ${err.message}`);
    }
  }
}

module.exports = {
  scaffold
};
