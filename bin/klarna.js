#!/usr/bin/env node

/**
 * Klarna Payments API CLI
 * @description Production-ready CLI for Klarna Payments API V1
 * @version 1.0.0
 */

import { Command } from 'commander';
import chalk from 'chalk';
import sessions from '../src/commands/sessions.js';
import orders from '../src/commands/orders.js';
import authorizations from '../src/commands/authorizations.js';
import config from '../src/commands/config.js';

const program = new Command();

program
  .name('klarna')
  .description('CLI for Klarna Payments API V1')
  .version('1.0.0')
  .addHelpText('after', `
Examples:
  $ klarna sessions create --data '{"order_amount":10000,"purchase_country":"US","purchase_currency":"USD","order_lines":[{"name":"Product","quantity":1,"unit_price":10000,"total_amount":10000}]}'
  $ klarna sessions get <session_id>
  $ klarna orders create <auth_token> --file order.json
  $ klarna authorizations cancel <auth_token>
  $ klarna config set username YOUR_USERNAME
  $ klarna config set password YOUR_PASSWORD

Environment Variables:
  KLARNA_USERNAME    API username
  KLARNA_PASSWORD    API password
  KLARNA_API_URL     API base URL (default: https://api.klarna.com)
  KLARNA_REGION      API region: eu, na, oc (default: eu)
  KLARNA_TIMEOUT     Request timeout in ms (default: 30000)
  KLARNA_VERBOSE     Verbose output (default: false)

Documentation:
  README: https://github.com/ktmcp/klarna-cli
  API Docs: https://docs.klarna.com/api/payments/
  `);

// Add command groups
program.addCommand(sessions);
program.addCommand(orders);
program.addCommand(authorizations);
program.addCommand(config);

// Global error handler
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error.message);
  if (process.env.KLARNA_VERBOSE === 'true') {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise);
  console.error(chalk.red('Reason:'), reason);
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
