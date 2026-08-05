#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function runCommand(command, cwd = process.cwd()) {
  try {
    const output = execSync(command, { 
      cwd, 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return { success: true, output: output.trim() };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout?.trim() || error.message,
      error: error.message
    };
  }
}

function checkEnvironment() {
  log('🔍 Checking test environment...', 'cyan');
  
  const requiredEnvVars = ['NODE_ENV', 'DB_HOST', 'DB_USER', 'DB_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'red');
    log('Please set up your .env file with the required variables', 'yellow');
    return false;
  }
  
  // Check if test database is accessible
  const dbCheck = runCommand('psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"');
  if (!dbCheck.success) {
    log('⚠️  Cannot connect to test database', 'yellow');
    log('Make sure PostgreSQL is running and test database exists', 'yellow');
  }
  
  // Check Redis connection
  const redisCheck = runCommand('redis-cli -h $REDIS_HOST ping');
  if (!redisCheck.success) {
    log('⚠️  Cannot connect to Redis', 'yellow');
  }
  
  log('✅ Environment check complete', 'green');
  return true;
}

function installDependencies() {
  log('📦 Installing test dependencies...', 'cyan');
  
  const projects = ['motor', 'dashboard', 'tests'];
  
  for (const project of projects) {
    const projectPath = join(process.cwd(), project);
    if (!existsSync(projectPath)) continue;
    
    log(`Installing dependencies for ${project}...`, 'blue');
    const result = runCommand('npm ci', projectPath);
    
    if (!result.success) {
      log(`❌ Failed to install dependencies for ${project}`, 'red');
      log(result.error, 'red');
      return false;
    }
  }
  
  log('✅ Dependencies installed', 'green');
  return true;
}

function runUnitTests() {
  log('🧪 Running unit tests...', 'cyan');
  
  // Motor unit tests
  log('Running motor unit tests...', 'blue');
  const motorResult = runCommand('npm run test:coverage', 'motor');
  
  if (!motorResult.success) {
    log('❌ Motor unit tests failed', 'red');
    log(motorResult.output, 'red');
    return false;
  }
  
  // Dashboard component tests
  log('Running dashboard component tests...', 'blue');
  const dashboardResult = runCommand('npm run test:coverage', 'dashboard');
  
  if (!dashboardResult.success) {
    log('❌ Dashboard component tests failed', 'red');
    log(dashboardResult.output, 'red');
    return false;
  }
  
  log('✅ Unit tests passed', 'green');
  return true;
}

function runIntegrationTests() {
  log('🔗 Running integration tests...', 'cyan');
  
  const result = runCommand('npm run test:integration', 'tests');
  
  if (!result.success) {
    log('❌ Integration tests failed', 'red');
    log(result.output, 'red');
    return false;
  }
  
  log('✅ Integration tests passed', 'green');
  return true;
}

function runE2ETests() {
  log('🌐 Running E2E tests...', 'cyan');
  
  // Install Playwright browsers if needed
  const playwrightCheck = runCommand('npx playwright --version', 'tests');
  if (!playwrightCheck.success) {
    log('Installing Playwright browsers...', 'blue');
    runCommand('npx playwright install', 'tests');
  }
  
  const result = runCommand('npm run test:e2e', 'tests');
  
  if (!result.success) {
    log('❌ E2E tests failed', 'red');
    log(result.output, 'red');
    return false;
  }
  
  log('✅ E2E tests passed', 'green');
  return true;
}

function checkCoverage() {
  log('📊 Checking coverage thresholds...', 'cyan');
  
  const coverageFiles = [
    'motor/coverage/coverage-summary.json',
    'dashboard/coverage/coverage-summary.json'
  ];
  
  const THRESHOLD = 80;
  let allPassed = true;
  
  for (const file of coverageFiles) {
    if (!existsSync(file)) {
      log(`⚠️  Coverage file not found: ${file}`, 'yellow');
      continue;
    }
    
    try {
      const coverage = JSON.parse(readFileSync(file, 'utf8'));
      const { total } = coverage;
      
      const project = file.split('/')[0];
      log(`\n📈 ${project} Coverage:`, 'blue');
      log(`  Lines: ${total.lines.pct}%`, total.lines.pct >= THRESHOLD ? 'green' : 'red');
      log(`  Functions: ${total.functions.pct}%`, total.functions.pct >= THRESHOLD ? 'green' : 'red');
      log(`  Branches: ${total.branches.pct}%`, total.branches.pct >= THRESHOLD ? 'green' : 'red');
      log(`  Statements: ${total.statements.pct}%`, total.statements.pct >= THRESHOLD ? 'green' : 'red');
      
      const metrics = ['lines', 'functions', 'branches', 'statements'];
      for (const metric of metrics) {
        if (total[metric].pct < THRESHOLD) {
          log(`❌ ${project} ${metric} coverage below ${THRESHOLD}%`, 'red');
          allPassed = false;
        }
      }
    } catch (error) {
      log(`❌ Error reading coverage file ${file}: ${error.message}`, 'red');
      allPassed = false;
    }
  }
  
  if (allPassed) {
    log('\n✅ All coverage thresholds met!', 'green');
  } else {
    log('\n❌ Some coverage thresholds not met', 'red');
  }
  
  return allPassed;
}

function generateReport() {
  log('📋 Generating test report...', 'cyan');
  
  const reportPath = join(process.cwd(), 'test-report.md');
  const timestamp = new Date().toISOString();
  
  let report = `# Test Report\n\n**Generated:** ${timestamp}\n\n`;
  
  // Add coverage summaries
  const coverageFiles = [
    'motor/coverage/coverage-summary.json',
    'dashboard/coverage/coverage-summary.json'
  ];
  
  report += '## Coverage Summary\n\n';
  
  for (const file of coverageFiles) {
    if (existsSync(file)) {
      try {
        const coverage = JSON.parse(readFileSync(file, 'utf8'));
        const project = file.split('/')[0];
        
        report += `### ${project}\n\n`;
        report += `- Lines: ${coverage.total.lines.pct}%\n`;
        report += `- Functions: ${coverage.total.functions.pct}%\n`;
        report += `- Branches: ${coverage.total.branches.pct}%\n`;
        report += `- Statements: ${coverage.total.statements.pct}%\n\n`;
      } catch (error) {
        report += `### ${project}\n\nError reading coverage: ${error.message}\n\n`;
      }
    }
  }
  
  require('fs').writeFileSync(reportPath, report);
  log(`📄 Test report generated: ${reportPath}`, 'green');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  log('🚀 Hotmart Testing Suite Runner', 'magenta');
  log('=====================================', 'magenta');
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  switch (command) {
    case 'env':
      checkEnvironment();
      break;
      
    case 'install':
      installDependencies();
      break;
      
    case 'unit':
      if (!checkEnvironment()) process.exit(1);
      if (!installDependencies()) process.exit(1);
      if (!runUnitTests()) process.exit(1);
      checkCoverage();
      break;
      
    case 'integration':
      if (!checkEnvironment()) process.exit(1);
      if (!installDependencies()) process.exit(1);
      if (!runIntegrationTests()) process.exit(1);
      break;
      
    case 'e2e':
      if (!installDependencies()) process.exit(1);
      if (!runE2ETests()) process.exit(1);
      break;
      
    case 'coverage':
      checkCoverage();
      break;
      
    case 'report':
      generateReport();
      break;
      
    case 'all':
    default:
      log('🏃 Running complete test suite...', 'cyan');
      
      let allPassed = true;
      
      if (!checkEnvironment()) {
        log('❌ Environment check failed', 'red');
        process.exit(1);
      }
      
      if (!installDependencies()) {
        log('❌ Dependency installation failed', 'red');
        process.exit(1);
      }
      
      if (!runUnitTests()) {
        log('❌ Unit tests failed', 'red');
        allPassed = false;
      }
      
      if (!runIntegrationTests()) {
        log('❌ Integration tests failed', 'red');
        allPassed = false;
      }
      
      if (!runE2ETests()) {
        log('❌ E2E tests failed', 'red');
        allPassed = false;
      }
      
      if (!checkCoverage()) {
        log('❌ Coverage thresholds not met', 'red');
        allPassed = false;
      }
      
      generateReport();
      
      if (allPassed) {
        log('\n🎉 All tests passed! System is ready for deployment.', 'green');
        log('=====================================', 'green');
      } else {
        log('\n❌ Some tests failed. Please review the output above.', 'red');
        log('=====================================', 'red');
        process.exit(1);
      }
      break;
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log(`❌ Uncaught exception: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled rejection at: ${promise}, reason: ${reason}`, 'red');
  process.exit(1);
});

main().catch(error => {
  log(`❌ Test runner failed: ${error.message}`, 'red');
  process.exit(1);
});