/**
 * Order management commands
 * @module commands/orders
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { createOrder } from '../lib/api.js';
import { readFileSync } from 'fs';

const orders = new Command('orders');

orders
  .description('Manage orders and authorizations');

/**
 * Create order command
 */
orders
  .command('create')
  .description('Create an order from authorization token')
  .argument('<authToken>', 'Authorization token')
  .option('-f, --file <path>', 'JSON file with order data')
  .option('-d, --data <json>', 'Order data as JSON string')
  .option('--username <username>', 'API username')
  .option('--password <password>', 'API password')
  .option('--region <region>', 'API region (eu, na, oc)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (authToken, options) => {
    try {
      let orderData;

      if (options.file) {
        const fileContent = readFileSync(options.file, 'utf8');
        orderData = JSON.parse(fileContent);
      } else if (options.data) {
        orderData = JSON.parse(options.data);
      } else {
        console.error(chalk.red('Error: Order data required. Use --file or --data option.'));
        console.log('\nExample:');
        console.log('  klarna orders create <token> --data \'{"order_amount":10000,"purchase_country":"US","purchase_currency":"USD","order_lines":[...]}\'');
        process.exit(1);
      }

      // Validate required fields
      const required = ['order_amount', 'purchase_country', 'purchase_currency', 'order_lines'];
      const missing = required.filter(field => !orderData[field]);

      if (missing.length > 0) {
        console.error(chalk.red(`Error: Missing required fields: ${missing.join(', ')}`));
        process.exit(1);
      }

      if (options.verbose) {
        console.log(chalk.blue(`Creating order with auth token: ${authToken}`));
        console.log(JSON.stringify(orderData, null, 2));
      }

      const result = await createOrder(authToken, orderData, options);

      if (result.success) {
        console.log(chalk.green('✓ Order created successfully'));
        console.log(chalk.bold('\nOrder ID:'), result.data.order_id);
        console.log(chalk.bold('Fraud Status:'), result.data.fraud_status);

        if (options.verbose) {
          console.log(chalk.blue('\nFull response:'));
          console.log(JSON.stringify(result.data, null, 2));
        }

        process.exit(0);
      } else {
        console.error(chalk.red(`✗ Failed to create order (${result.status})`));
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

export default orders;
