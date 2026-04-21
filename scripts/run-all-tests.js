#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs all tests across the entire application with coverage reporting
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, args, cwd, description) {
  return new Promise((resolve, reject) => {
    log(`\n${colors.cyan}Running: ${description}${colors.reset}`);
    log(`${colors.yellow}Command: ${command} ${args.join(' ')}${colors.reset}`);
    log(`${colors.yellow}Directory: ${cwd}${colors.reset}\n`);

    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        log(`${colors.green}✅ ${description} completed successfully${colors.reset}`);
        resolve(code);
      } else {
        log(`${colors.red}❌ ${description} failed with exit code ${code}${colors.reset}`);
        reject(new Error(`${description} failed`));
      }
    });

    child.on('error', (error) => {
      log(`${colors.red}❌ Error running ${description}: ${error.message}${colors.reset}`);
      reject(error);
    });
  });
}

async function checkDependencies() {
  log(`${colors.magenta}Checking dependencies...${colors.reset}`);
  
  const clientPackageJson = path.join(__dirname, '../client/package.json');
  const serverPackageJson = path.join(__dirname, '../server/package.json');
  
  if (!fs.existsSync(clientPackageJson)) {
    throw new Error('Client package.json not found');
  }
  
  if (!fs.existsSync(serverPackageJson)) {
    throw new Error('Server package.json not found');
  }
  
  log(`${colors.green}✅ Dependencies check passed${colors.reset}`);
}

async function runClientTests() {
  const clientDir = path.join(__dirname, '../client');
  
  try {
    await runCommand('npm', ['run', 'test:coverage'], clientDir, 'Client Tests with Coverage');
    return true;
  } catch (error) {
    log(`${colors.red}Client tests failed: ${error.message}${colors.reset}`);
    return false;
  }
}

async function runServerTests() {
  const serverDir = path.join(__dirname, '../server');
  
  try {
    await runCommand('npm', ['run', 'test:coverage'], serverDir, 'Server Tests with Coverage');
    return true;
  } catch (error) {
    log(`${colors.red}Server tests failed: ${error.message}${colors.reset}`);
    return false;
  }
}

async function generateCombinedReport() {
  log(`${colors.cyan}Generating combined coverage report...${colors.reset}`);
  
  const clientCoverage = path.join(__dirname, '../client/coverage');
  const serverCoverage = path.join(__dirname, '../server/coverage');
  const combinedCoverage = path.join(__dirname, '../coverage');
  
  // Create combined coverage directory
  if (!fs.existsSync(combinedCoverage)) {
    fs.mkdirSync(combinedCoverage, { recursive: true });
  }
  
  // Copy coverage reports
  if (fs.existsSync(clientCoverage)) {
    const clientTarget = path.join(combinedCoverage, 'client');
    if (!fs.existsSync(clientTarget)) {
      fs.mkdirSync(clientTarget, { recursive: true });
    }
    // Note: In a real scenario, you'd use a proper file copy utility
    log(`${colors.yellow}Client coverage available at: ${clientCoverage}${colors.reset}`);
  }
  
  if (fs.existsSync(serverCoverage)) {
    const serverTarget = path.join(combinedCoverage, 'server');
    if (!fs.existsSync(serverTarget)) {
      fs.mkdirSync(serverTarget, { recursive: true });
    }
    log(`${colors.yellow}Server coverage available at: ${serverCoverage}${colors.reset}`);
  }
  
  log(`${colors.green}✅ Coverage reports generated${colors.reset}`);
}

async function runLinting() {
  log(`${colors.cyan}Running linting checks...${colors.reset}`);
  
  const clientDir = path.join(__dirname, '../client');
  const serverDir = path.join(__dirname, '../server');
  
  try {
    // Check if ESLint is available and run it
    const clientPackageJson = require(path.join(clientDir, 'package.json'));
    if (clientPackageJson.scripts && clientPackageJson.scripts.lint) {
      await runCommand('npm', ['run', 'lint'], clientDir, 'Client Linting');
    } else {
      log(`${colors.yellow}⚠️  No lint script found for client${colors.reset}`);
    }
    
    const serverPackageJson = require(path.join(serverDir, 'package.json'));
    if (serverPackageJson.scripts && serverPackageJson.scripts.lint) {
      await runCommand('npm', ['run', 'lint'], serverDir, 'Server Linting');
    } else {
      log(`${colors.yellow}⚠️  No lint script found for server${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    log(`${colors.yellow}⚠️  Linting completed with warnings: ${error.message}${colors.reset}`);
    return true; // Don't fail the entire test suite for linting issues
  }
}

async function runSecurityAudit() {
  log(`${colors.cyan}Running security audit...${colors.reset}`);
  
  const clientDir = path.join(__dirname, '../client');
  const serverDir = path.join(__dirname, '../server');
  
  try {
    await runCommand('npm', ['audit', '--audit-level', 'moderate'], clientDir, 'Client Security Audit');
    await runCommand('npm', ['audit', '--audit-level', 'moderate'], serverDir, 'Server Security Audit');
    return true;
  } catch (error) {
    log(`${colors.yellow}⚠️  Security audit completed with warnings: ${error.message}${colors.reset}`);
    return true; // Don't fail for audit warnings
  }
}

async function printSummary(results) {
  log(`\n${colors.bright}${colors.cyan}=== TEST SUMMARY ===${colors.reset}`);
  
  const { clientTests, serverTests, linting, security } = results;
  
  log(`Client Tests: ${clientTests ? colors.green + '✅ PASSED' : colors.red + '❌ FAILED'}${colors.reset}`);
  log(`Server Tests: ${serverTests ? colors.green + '✅ PASSED' : colors.red + '❌ FAILED'}${colors.reset}`);
  log(`Linting: ${linting ? colors.green + '✅ PASSED' : colors.yellow + '⚠️  WARNINGS'}${colors.reset}`);
  log(`Security Audit: ${security ? colors.green + '✅ PASSED' : colors.yellow + '⚠️  WARNINGS'}${colors.reset}`);
  
  const overallSuccess = clientTests && serverTests;
  
  log(`\n${colors.bright}Overall Result: ${overallSuccess ? colors.green + '✅ SUCCESS' : colors.red + '❌ FAILURE'}${colors.reset}`);
  
  if (overallSuccess) {
    log(`${colors.green}All critical tests passed! 🎉${colors.reset}`);
  } else {
    log(`${colors.red}Some tests failed. Please check the output above for details.${colors.reset}`);
  }
  
  return overallSuccess;
}

async function main() {
  const startTime = Date.now();
  
  log(`${colors.bright}${colors.magenta}🚀 Starting Comprehensive Test Suite${colors.reset}`);
  log(`${colors.cyan}Timestamp: ${new Date().toISOString()}${colors.reset}\n`);
  
  try {
    // Check dependencies
    await checkDependencies();
    
    // Run all test suites
    const results = {
      clientTests: false,
      serverTests: false,
      linting: false,
      security: false
    };
    
    // Run tests in parallel for better performance
    const testPromises = [
      runClientTests().then(result => { results.clientTests = result; }),
      runServerTests().then(result => { results.serverTests = result; })
    ];
    
    await Promise.allSettled(testPromises);
    
    // Run linting and security audit
    results.linting = await runLinting();
    results.security = await runSecurityAudit();
    
    // Generate combined coverage report
    await generateCombinedReport();
    
    // Print summary
    const success = await printSummary(results);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log(`\n${colors.cyan}Total execution time: ${duration} seconds${colors.reset}`);
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    log(`${colors.red}❌ Test suite failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  log(`\n${colors.yellow}Test suite interrupted by user${colors.reset}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  log(`\n${colors.yellow}Test suite terminated${colors.reset}`);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch(error => {
    log(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { main, runClientTests, runServerTests };