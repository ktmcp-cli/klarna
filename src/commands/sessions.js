/**
 * Session management commands
 * @module commands/sessions
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { createSession, getSession, updateSession } from '../lib/api.js';
import { readFileSync } from 'fs';

const sessions = new Command('sessions');

sessions
  .description('Manage payment sessions');

/**
 * Create session command
 */
sessions
  .command('create')
  .description('Create a new payment session')
  .option('-f, --file <path>', 'JSON file with session data')
  .option('-d, --data <json>', 'Session data as JSON string')
  .option('--username <username>', 'API username')
  .option('--password <password>', 'API password')
  .option('--region <region>', 'API region (eu, na, oc)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      let sessionData;

      if (options.file) {
        const fileContent = readFileSync(options.file, 'utf8');
        sessionData = JSON.parse(fileContent);
      } else if (options.data) {
        sessionData = JSON.parse(options.data);
      } else {
        console.error(chalk.red('Error: Session data required. Use --file or --data option.'));
        console.log('\nExample:');
        console.log('  klarna sessions create --data \'{"order_amount":10000,"purchase_country":"US","purchase_currency":"USD","order_lines":[{"name":"Product","quantity":1,"unit_price":10000,"total_amount":10000}]}\'');
        process.exit(1);
      }

      // Validate required fields
      const required = ['order_amount', 'purchase_country', 'purchase_currency', 'order_lines'];
      const missing = required.filter(field => !sessionData[field]);

      if (missing.length > 0) {
        console.error(chalk.red(`Error: Missing required fields: ${missing.join(', ')}`));
        process.exit(1);
      }

      if (options.verbose) {
        console.log(chalk.blue('Creating session with data:'));
        console.log(JSON.stringify(sessionData, null, 2));
      }

      const result = await createSession(sessionData, options);

      if (result.success) {
        console.log(chalk.green('✓ Session created successfully'));
        console.log(chalk.bold('\nSession ID:'), result.data.session_id);
        console.log(chalk.bold('Client Token:'), result.data.client_token);

        if (options.verbose) {
          console.log(chalk.blue('\nFull response:'));
          console.log(JSON.stringify(result.data, null, 2));
        }

        process.exit(0);
      } else {
        console.error(chalk.red(`✗ Failed to create session (${result.status})`));
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
 * Get session command
 */
sessions
  .command('get')
  .description('Get session details')
  .argument('<sessionId>', 'Session ID')
  .option('--username <username>', 'API username')
  .option('--password <password>', 'API password')
  .option('--region <region>', 'API region (eu, na, oc)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (sessionId, options) => {
    try {
      if (options.verbose) {
        console.log(chalk.blue(`Fetching session: ${sessionId}`));
      }

      const result = await getSession(sessionId, options);

      if (result.success) {
        console.log(chalk.green('✓ Session retrieved successfully'));
        console.log(JSON.stringify(result.data, null, 2));
        process.exit(0);
      } else {
        console.error(chalk.red(`✗ Failed to get session (${result.status})`));
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
 * Update session command
 */
sessions
  .command('update')
  .description('Update an existing session')
  .argument('<sessionId>', 'Session ID')
  .option('-f, --file <path>', 'JSON file with session data')
  .option('-d, --data <json>', 'Session data as JSON string')
  .option('--username <username>', 'API username')
  .option('--password <password>', 'API password')
  .option('--region <region>', 'API region (eu, na, oc)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (sessionId, options) => {
    try {
      let sessionData;

      if (options.file) {
        const fileContent = readFileSync(options.file, 'utf8');
        sessionData = JSON.parse(fileContent);
      } else if (options.data) {
        sessionData = JSON.parse(options.data);
      } else {
        console.error(chalk.red('Error: Session data required. Use --file or --data option.'));
        process.exit(1);
      }

      if (options.verbose) {
        console.log(chalk.blue(`Updating session: ${sessionId}`));
        console.log(JSON.stringify(sessionData, null, 2));
      }

      const result = await updateSession(sessionId, sessionData, options);

      if (result.success) {
        console.log(chalk.green('✓ Session updated successfully'));

        if (options.verbose) {
          console.log(chalk.blue('\nFull response:'));
          console.log(JSON.stringify(result.data, null, 2));
        }

        process.exit(0);
      } else {
        console.error(chalk.red(`✗ Failed to update session (${result.status})`));
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

export default sessions;
