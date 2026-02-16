/**
 * Authorization management commands
 * @module commands/authorizations
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { cancelAuthorization, generateCustomerToken } from '../lib/api.js';
import { readFileSync } from 'fs';

const authorizations = new Command('authorizations');

authorizations
  .description('Manage payment authorizations');

/**
 * Cancel authorization command
 */
authorizations
  .command('cancel')
  .description('Cancel an authorization')
  .argument('<authToken>', 'Authorization token')
  .option('--username <username>', 'API username')
  .option('--password <password>', 'API password')
  .option('--region <region>', 'API region (eu, na, oc)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (authToken, options) => {
    try {
      if (options.verbose) {
        console.log(chalk.blue(`Cancelling authorization: ${authToken}`));
      }

      const result = await cancelAuthorization(authToken, options);

      if (result.success) {
        console.log(chalk.green('✓ Authorization cancelled successfully'));
        process.exit(0);
      } else {
        console.error(chalk.red(`✗ Failed to cancel authorization (${result.status})`));
        console.error(chalk.red(result.message));

        if (options.verbose && result.data) {
          console.error(chalk.yellow('\nResponse data:'));
          console.error(JSON.stringify(result.data, null, 2));
        }

        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Generate customer token command
 */
authorizations
  .command('customer-token')
  .description('Generate a customer token from authorization')
  .argument('<authToken>', 'Authorization token')
  .option('-f, --file <path>', 'JSON file with token data')
  .option('-d, --data <json>', 'Token data as JSON string')
  .option('--username <username>', 'API username')
  .option('--password <password>', 'API password')
  .option('--region <region>', 'API region (eu, na, oc)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (authToken, options) => {
    try {
      let tokenData = {};

      if (options.file) {
        const fileContent = readFileSync(options.file, 'utf8');
        tokenData = JSON.parse(fileContent);
      } else if (options.data) {
        tokenData = JSON.parse(options.data);
      }

      if (options.verbose) {
        console.log(chalk.blue(`Generating customer token for: ${authToken}`));
        if (Object.keys(tokenData).length > 0) {
          console.log(JSON.stringify(tokenData, null, 2));
        }
      }

      const result = await generateCustomerToken(authToken, tokenData, options);

      if (result.success) {
        console.log(chalk.green('✓ Customer token generated successfully'));
        console.log(chalk.bold('\nToken ID:'), result.data.token_id);
        console.log(chalk.bold('Status:'), result.data.status);

        if (options.verbose) {
          console.log(chalk.blue('\nFull response:'));
          console.log(JSON.stringify(result.data, null, 2));
        }

        process.exit(0);
      } else {
        console.error(chalk.red(`✗ Failed to generate customer token (${result.status})`));
        console.error(chalk.red(result.message));

        if (options.verbose && result.data) {
          console.error(chalk.yellow('\nResponse data:'));
          console.error(JSON.stringify(result.data, null, 2));
        }

        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

export default authorizations;
