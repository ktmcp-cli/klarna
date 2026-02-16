# Contributing to Klarna CLI

Thank you for your interest in contributing to the Klarna Payments API CLI!

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment:
   ```bash
   cp .env.example .env
   # Edit .env with your test credentials
   ```
4. Link the CLI locally:
   ```bash
   npm link
   ```

## Project Structure

```
ktmcp-klarna-cli/
├── bin/
│   └── klarna.js           # Main CLI entry point
├── src/
│   ├── commands/           # Command implementations
│   │   ├── sessions.js     # Session management
│   │   ├── orders.js       # Order operations
│   │   ├── authorizations.js
│   │   └── config.js       # Configuration management
│   └── lib/                # Shared libraries
│       ├── api.js          # API client
│       ├── auth.js         # Authentication
│       └── config.js       # Config handling
├── examples/               # Usage examples
├── README.md
├── AGENT.md               # AI agent guide
├── OPENCLAW.md            # OpenClaw integration
└── package.json
```

## Coding Standards

### JavaScript Style

- Use ES6+ features (import/export, async/await, arrow functions)
- Use `const` by default, `let` when reassignment needed
- Prefer template literals over string concatenation
- Use JSDoc comments for functions

Example:
```javascript
/**
 * Create a new payment session
 * @param {Object} sessionData - Session data
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
export async function createSession(sessionData, options = {}) {
  // Implementation
}
```

### Error Handling

- Always return structured error objects
- Include status codes and messages
- Use try-catch for async operations
- Provide helpful error messages

Example:
```javascript
try {
  const response = await client.post('/path', data);
  return {
    success: true,
    status: response.status,
    data: response.data
  };
} catch (error) {
  return {
    success: false,
    status: error.response?.status || 0,
    message: error.response?.data?.message || error.message
  };
}
```

### Exit Codes

- Use `0` for success
- Use `1` for errors
- Always call `process.exit()` with appropriate code

### Output Formatting

- Use `chalk` for colored output
- Use consistent formatting:
  - `chalk.green('✓')` for success
  - `chalk.red('✗')` for errors
  - `chalk.blue()` for informational messages
  - `chalk.yellow()` for warnings

## Adding New Commands

1. Create a new file in `src/commands/`:
   ```javascript
   import { Command } from 'commander';
   import chalk from 'chalk';

   const myCommand = new Command('mycommand');

   myCommand
     .description('My command description')
     .action(async (options) => {
       // Implementation
     });

   export default myCommand;
   ```

2. Import and register in `bin/klarna.js`:
   ```javascript
   import myCommand from '../src/commands/myCommand.js';
   program.addCommand(myCommand);
   ```

3. Add tests and documentation

## Adding API Endpoints

1. Add the method to `src/lib/api.js`:
   ```javascript
   export async function myEndpoint(data, options = {}) {
     try {
       const client = createClient(options);
       const response = await client.post('/my/endpoint', data);
       return {
         success: true,
         status: response.status,
         data: response.data
       };
     } catch (error) {
       return handleError(error);
     }
   }
   ```

2. Create a command that uses it
3. Document in README.md and AGENT.md
4. Add example files if needed

## Documentation

When adding features, update:

- **README.md**: User-facing documentation with examples
- **AGENT.md**: AI agent integration patterns
- **OPENCLAW.md**: OpenClaw tool definitions
- **JSDoc comments**: Inline code documentation

## Testing

### Manual Testing

```bash
# Test session creation
klarna sessions create --file examples/session.json -v

# Test with different regions
klarna sessions create --file examples/session.json --region na

# Test error handling
klarna sessions get invalid_session_id
```

### Test Checklist

Before submitting a PR, test:

- [ ] All commands execute without errors
- [ ] Error messages are clear and helpful
- [ ] Exit codes are correct (0 for success, 1 for errors)
- [ ] JSON output is valid and parseable
- [ ] Verbose mode provides useful information
- [ ] Help text is clear and accurate
- [ ] Works with environment variables
- [ ] Works with config file
- [ ] Works with command-line options

## Git Workflow

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. Make your changes
4. Commit with clear messages:
   ```bash
   git commit -m "Add: New feature description"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```
6. Open a Pull Request

### Commit Message Format

Use conventional commit format:

- `Add:` - New features
- `Fix:` - Bug fixes
- `Update:` - Updates to existing features
- `Docs:` - Documentation changes
- `Refactor:` - Code refactoring
- `Test:` - Adding or updating tests

Examples:
```
Add: Support for custom timeout configuration
Fix: Handle expired sessions gracefully
Update: Improve error messages for API failures
Docs: Add examples for order creation
```

## Pull Request Guidelines

### PR Description

Include:
- What changes were made
- Why the changes were made
- How to test the changes
- Any breaking changes

### PR Checklist

- [ ] Code follows project style
- [ ] JSDoc comments added/updated
- [ ] README.md updated if needed
- [ ] AGENT.md updated if needed
- [ ] Examples added if needed
- [ ] Tested manually
- [ ] No console.log or debug statements
- [ ] Exit codes are correct

## Common Issues

### "Command not found"

After changes to `bin/klarna.js`:
```bash
npm unlink
npm link
```

### "Module not found"

Check import paths use `.js` extension:
```javascript
import config from './config.js';  // Correct
import config from './config';     // Wrong
```

### Credentials Not Working

Test credentials with minimal example:
```bash
klarna config show
klarna config set username YOUR_USERNAME
klarna config set password YOUR_PASSWORD
```

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing!
