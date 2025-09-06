#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const { program } = require('commander');

const { detectPackageManagers, checkNodeVersion, createProject } = require('./components/project-setup');
const { getPrompts, getConfirmationPrompt } = require('./components/prompts');

async function main() {
  // Parse command line arguments
  program
    .name('create-enfyra-be')
    .description('Create a new Enfyra backend application')
    .argument('[project-name]', 'Name of your project')
    .option('--skip-prompts', 'Skip interactive prompts and use defaults')
    .parse();

  console.log(chalk.cyan.bold('\n╔════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║   🚀 Create Enfyra Backend    ║'));
  console.log(chalk.cyan.bold('╚════════════════════════════════╝\n'));
  
  // Check Node version
  checkNodeVersion();

  // Check available package managers
  const availableManagers = detectPackageManagers();
  if (availableManagers.length === 0) {
    console.log(chalk.red('❌ No package manager found! Please install npm, yarn, or bun.'));
    process.exit(1);
  }

  // Get project name from arguments or prompt
  const projectNameArg = program.args[0];
  
  // Get configuration from user
  const config = await inquirer.prompt(getPrompts(availableManagers, projectNameArg));
  
  // Add project name if provided as argument
  if (projectNameArg) {
    // Validate project name argument
    const validation = require('./components/validators').projectName(projectNameArg);
    if (validation !== true) {
      console.log(chalk.red(`❌ ${validation}`));
      process.exit(1);
    }
    config.projectName = projectNameArg;
  }

  // Simple confirmation without excessive output
  const { confirm } = await inquirer.prompt([getConfirmationPrompt()]);

  if (!confirm) {
    console.log(chalk.red('\n❌ Installation cancelled'));
    process.exit(0);
  }

  // Create the project
  try {
    await createProject(config);
  } catch (error) {
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error(chalk.red(`\n❌ Unexpected error: ${error.message}`));
  process.exit(1);
});

// Run
main().catch(error => {
  console.error(chalk.red(`\n❌ Error: ${error.message}`));
  process.exit(1);
});