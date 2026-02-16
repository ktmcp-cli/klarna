/**
 * Configuration management commands
 * @module commands/config
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig, setConfig, REGIONS } from '../lib/config.js';

const config = new Command('config');

config
  .description('Manage CLI configuration');

/**
 * Show current configuration
 */
config
  .command('show')
  .description('Show current configuration')
  .action(() => {
    try {
      const currentConfig = loadConfig();

      console.log(chalk.bold('Current Configuration:'));
      console.log(chalk.blue('Base URL:'), currentConfig.baseUrl);
      console.log(chalk.blue('Username:'), currentConfig.username || chalk.gray('(not set)'));
      console.log(chalk.blue('Password:'), currentConfig.password ? chalk.green('(set)') : chalk.gray('(not set)'));
      console.log(chalk.blue('Region:'), currentConfig.region);
      console.log(chalk.blue('Timeout:'), `${currentConfig.timeout}ms`);
      console.log(chalk.blue('Verbose:'), currentConfig.verbose);

      process.exit(0);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Set configuration value
 */
config
  .command('set')
  .description('Set a configuration value')
  .argument('<key>', 'Configuration key (username, password, region, timeout, verbose)')
  .argument('<value>', 'Configuration value')
  .action((key, value) => {
    try {
      const validKeys = ['username', 'password', 'region', 'timeout', 'verbose', 'baseUrl'];

      if (!validKeys.includes(key)) {
        console.error(chalk.red(`Error: Invalid configuration key. Valid keys: ${validKeys.join(', ')}`));
        process.exit(1);
      }

      // Validate region
      if (key === 'region' && !REGIONS[value]) {
        console.error(chalk.red(`Error: Invalid region. Valid regions: ${Object.keys(REGIONS).join(', ')}`));
        process.exit(1);
      }

      // Convert types
      let finalValue = value;
      if (key === 'timeout') {
        finalValue = parseInt(value, 10);
        if (isNaN(finalValue)) {
          console.error(chalk.red('Error: Timeout must be a number'));
          process.exit(1);
        }
      } else if (key === 'verbose') {
        finalValue = value === 'true';
      }

      if (setConfig(key, finalValue)) {
        console.log(chalk.green(`✓ Configuration updated: ${key} = ${finalValue}`));
        process.exit(0);
      } else {
        console.error(chalk.red('Failed to save configuration'));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Reset configuration to defaults
 */
config
  .command('reset')
  .description('Reset configuration to defaults')
  .action(() => {
    try {
      const defaultConfig = {
        baseUrl: 'https://api.klarna.com',
        username: '',
        password: '',
        region: 'eu',
        timeout: 30000,
        verbose: false
      };

      if (saveConfig(defaultConfig)) {
        console.log(chalk.green('✓ Configuration reset to defaults'));
        process.exit(0);
      } else {
        console.error(chalk.red('Failed to reset configuration'));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

export default config;
