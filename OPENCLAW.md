# Klarna CLI - OpenClaw Integration Guide

OpenClaw integration guide for the Klarna Payments API CLI. This document explains how to expose the CLI as an OpenClaw-compatible tool for AI agents.

## What is OpenClaw?

OpenClaw is a standard for exposing CLI tools to AI agents through a simple, declarative interface. It enables AI agents to discover and use CLI tools without custom MCP servers.

## Installation for OpenClaw

### 1. Install the CLI

```bash
npm install -g @ktmcp-cli/klarna
```

### 2. Configure Credentials

```bash
# Set credentials via environment variables
export KLARNA_USERNAME="your_username"
export KLARNA_PASSWORD="your_password"
export KLARNA_REGION="eu"

# Or use CLI config
klarna config set username your_username
klarna config set password your_password
klarna config set region eu
```

### 3. Verify Installation

```bash
klarna --version
klarna config show
```

## OpenClaw Tool Definitions

### Tool: klarna_create_session

Create a new Klarna payment session.

**Schema:**
```json
{
  "name": "klarna_create_session",
  "description": "Create a new Klarna payment session",
  "command": "klarna sessions create --file {{file}}",
  "input_schema": {
    "type": "object",
    "properties": {
      "file": {
        "type": "string",
        "description": "Path to JSON file with session data"
      }
    },
    "required": ["file"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "session_id": { "type": "string" },
      "client_token": { "type": "string" },
      "expires_at": { "type": "string" }
    }
  }
}
```

**Example:**
```bash
klarna sessions create --file /tmp/session.json
```

### Tool: klarna_get_session

Retrieve details of an existing session.

**Schema:**
```json
{
  "name": "klarna_get_session",
  "description": "Get Klarna session details",
  "command": "klarna sessions get {{session_id}}",
  "input_schema": {
    "type": "object",
    "properties": {
      "session_id": {
        "type": "string",
        "description": "The session ID to retrieve"
      }
    },
    "required": ["session_id"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "session_id": { "type": "string" },
      "client_token": { "type": "string" },
      "order_amount": { "type": "integer" },
      "order_lines": { "type": "array" }
    }
  }
}
```

**Example:**
```bash
klarna sessions get abc-123-def-456
```

### Tool: klarna_update_session

Update an existing payment session.

**Schema:**
```json
{
  "name": "klarna_update_session",
  "description": "Update an existing Klarna session",
  "command": "klarna sessions update {{session_id}} --file {{file}}",
  "input_schema": {
    "type": "object",
    "properties": {
      "session_id": {
        "type": "string",
        "description": "The session ID to update"
      },
      "file": {
        "type": "string",
        "description": "Path to JSON file with updated session data"
      }
    },
    "required": ["session_id", "file"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "session_id": { "type": "string" },
      "status": { "type": "string" }
    }
  }
}
```

**Example:**
```bash
klarna sessions update abc-123-def-456 --file /tmp/updated_session.json
```

### Tool: klarna_create_order

Create an order from an authorization token.

**Schema:**
```json
{
  "name": "klarna_create_order",
  "description": "Create a Klarna order from authorization",
  "command": "klarna orders create {{auth_token}} --file {{file}}",
  "input_schema": {
    "type": "object",
    "properties": {
      "auth_token": {
        "type": "string",
        "description": "Authorization token from payment flow"
      },
      "file": {
        "type": "string",
        "description": "Path to JSON file with order data"
      }
    },
    "required": ["auth_token", "file"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "order_id": { "type": "string" },
      "fraud_status": { "type": "string" }
    }
  }
}
```

**Example:**
```bash
klarna orders create auth_token_xyz --file /tmp/order.json
```

### Tool: klarna_cancel_authorization

Cancel a payment authorization.

**Schema:**
```json
{
  "name": "klarna_cancel_authorization",
  "description": "Cancel a Klarna authorization",
  "command": "klarna authorizations cancel {{auth_token}}",
  "input_schema": {
    "type": "object",
    "properties": {
      "auth_token": {
        "type": "string",
        "description": "Authorization token to cancel"
      }
    },
    "required": ["auth_token"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "status": { "type": "string" }
    }
  }
}
```

**Example:**
```bash
klarna authorizations cancel auth_token_xyz
```

### Tool: klarna_generate_customer_token

Generate a customer token for recurring payments.

**Schema:**
```json
{
  "name": "klarna_generate_customer_token",
  "description": "Generate a Klarna customer token",
  "command": "klarna authorizations customer-token {{auth_token}} --file {{file}}",
  "input_schema": {
    "type": "object",
    "properties": {
      "auth_token": {
        "type": "string",
        "description": "Authorization token"
      },
      "file": {
        "type": "string",
        "description": "Path to JSON file with token data (optional)",
        "default": ""
      }
    },
    "required": ["auth_token"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "token_id": { "type": "string" },
      "status": { "type": "string" }
    }
  }
}
```

**Example:**
```bash
klarna authorizations customer-token auth_token_xyz
```

## Complete OpenClaw Manifest

Create a `.openclaw.json` file in your project:

```json
{
  "name": "klarna-payments",
  "version": "1.0.0",
  "description": "Klarna Payments API CLI tools",
  "tools": [
    {
      "name": "klarna_create_session",
      "description": "Create a new Klarna payment session",
      "command": "klarna sessions create --file {{file}}",
      "input_schema": {
        "type": "object",
        "properties": {
          "file": {
            "type": "string",
            "description": "Path to JSON file with session data"
          }
        },
        "required": ["file"]
      }
    },
    {
      "name": "klarna_get_session",
      "description": "Get Klarna session details",
      "command": "klarna sessions get {{session_id}}",
      "input_schema": {
        "type": "object",
        "properties": {
          "session_id": {
            "type": "string",
            "description": "The session ID to retrieve"
          }
        },
        "required": ["session_id"]
      }
    },
    {
      "name": "klarna_update_session",
      "description": "Update an existing Klarna session",
      "command": "klarna sessions update {{session_id}} --file {{file}}",
      "input_schema": {
        "type": "object",
        "properties": {
          "session_id": {
            "type": "string",
            "description": "The session ID to update"
          },
          "file": {
            "type": "string",
            "description": "Path to JSON file with updated session data"
          }
        },
        "required": ["session_id", "file"]
      }
    },
    {
      "name": "klarna_create_order",
      "description": "Create a Klarna order from authorization",
      "command": "klarna orders create {{auth_token}} --file {{file}}",
      "input_schema": {
        "type": "object",
        "properties": {
          "auth_token": {
            "type": "string",
            "description": "Authorization token from payment flow"
          },
          "file": {
            "type": "string",
            "description": "Path to JSON file with order data"
          }
        },
        "required": ["auth_token", "file"]
      }
    },
    {
      "name": "klarna_cancel_authorization",
      "description": "Cancel a Klarna authorization",
      "command": "klarna authorizations cancel {{auth_token}}",
      "input_schema": {
        "type": "object",
        "properties": {
          "auth_token": {
            "type": "string",
            "description": "Authorization token to cancel"
          }
        },
        "required": ["auth_token"]
      }
    },
    {
      "name": "klarna_generate_customer_token",
      "description": "Generate a Klarna customer token",
      "command": "klarna authorizations customer-token {{auth_token}}",
      "input_schema": {
        "type": "object",
        "properties": {
          "auth_token": {
            "type": "string",
            "description": "Authorization token"
          }
        },
        "required": ["auth_token"]
      }
    }
  ]
}
```

## AI Agent Usage Examples

### Example 1: Create Payment Session

**AI Agent Workflow:**

1. Prepare session data
2. Write to temporary file
3. Call klarna_create_session tool
4. Parse response for session_id

**Implementation:**
```bash
# Agent creates temp file
cat > /tmp/klarna_session_$$.json << 'EOF'
{
  "order_amount": 10000,
  "purchase_country": "US",
  "purchase_currency": "USD",
  "order_lines": [{
    "name": "Product",
    "quantity": 1,
    "unit_price": 10000,
    "total_amount": 10000
  }]
}
EOF

# Agent calls tool
RESULT=$(klarna sessions create --file /tmp/klarna_session_$$.json)

# Agent extracts session_id
SESSION_ID=$(echo "$RESULT" | jq -r '.session_id')

# Clean up
rm /tmp/klarna_session_$$.json
```

### Example 2: Complete Order Flow

**AI Agent Workflow:**

1. Create session
2. User completes payment (external)
3. Create order from auth token
4. Return order ID to user

**Implementation:**
```bash
# Step 1: Create session
cat > /tmp/session.json << 'EOF'
{ "order_amount": 10000, ... }
EOF
SESSION=$(klarna sessions create --file /tmp/session.json)
SESSION_ID=$(echo "$SESSION" | jq -r '.session_id')

# Step 2: (User payment happens in frontend)
# Agent receives AUTH_TOKEN

# Step 3: Create order
cat > /tmp/order.json << 'EOF'
{ "order_amount": 10000, ..., "merchant_urls": {...} }
EOF
ORDER=$(klarna orders create "$AUTH_TOKEN" --file /tmp/order.json)
ORDER_ID=$(echo "$ORDER" | jq -r '.order_id')

# Step 4: Report to user
echo "Order created successfully: $ORDER_ID"
```

## Error Handling for OpenClaw

AI agents should check exit codes and parse stderr:

```bash
# Execute command and capture output and exit code
if output=$(klarna sessions create --file session.json 2>&1); then
  # Success (exit code 0)
  echo "Success: $output"
else
  # Error (exit code 1)
  echo "Error: $output"
  # Parse error message for specific handling
fi
```

## Environment Setup for OpenClaw

Ensure environment is configured before invoking tools:

```bash
# Check if credentials are set
if [ -z "$KLARNA_USERNAME" ] || [ -z "$KLARNA_PASSWORD" ]; then
  echo "Error: Set KLARNA_USERNAME and KLARNA_PASSWORD environment variables"
  exit 1
fi

# Verify CLI is installed
if ! command -v klarna &> /dev/null; then
  echo "Error: Klarna CLI not installed. Run: npm install -g @ktmcp-cli/klarna"
  exit 1
fi

# Test connectivity
if ! klarna config show &> /dev/null; then
  echo "Error: Cannot connect to Klarna CLI"
  exit 1
fi
```

## Data Validation for OpenClaw Tools

AI agents should validate input before calling tools:

```bash
# Validate session data
validate_session_data() {
  local file=$1

  # Check file exists
  [ ! -f "$file" ] && echo "File not found" && return 1

  # Validate JSON structure
  if ! jq -e '.order_amount and .purchase_country and .purchase_currency and .order_lines' "$file" > /dev/null; then
    echo "Missing required fields"
    return 1
  fi

  # Validate amount is positive integer
  local amount=$(jq -r '.order_amount' "$file")
  if ! [[ "$amount" =~ ^[0-9]+$ ]] || [ "$amount" -le 0 ]; then
    echo "Invalid order_amount"
    return 1
  fi

  return 0
}
```

## Response Parsing Patterns

Standard patterns for parsing CLI responses:

```bash
# Parse JSON response
parse_response() {
  local response=$1
  local field=$2

  echo "$response" | jq -r ".$field"
}

# Example usage
SESSION_RESPONSE=$(klarna sessions create --file session.json)
SESSION_ID=$(parse_response "$SESSION_RESPONSE" "session_id")
CLIENT_TOKEN=$(parse_response "$SESSION_RESPONSE" "client_token")
```

## Testing OpenClaw Integration

Verify OpenClaw tools work correctly:

```bash
# Test session creation
test_create_session() {
  cat > /tmp/test_session.json << 'EOF'
  {
    "order_amount": 10000,
    "purchase_country": "US",
    "purchase_currency": "USD",
    "order_lines": [{
      "name": "Test Product",
      "quantity": 1,
      "unit_price": 10000,
      "total_amount": 10000
    }]
  }
EOF

  if RESULT=$(klarna sessions create --file /tmp/test_session.json 2>&1); then
    SESSION_ID=$(echo "$RESULT" | jq -r '.session_id')
    if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
      echo "✓ Session creation test passed: $SESSION_ID"
      rm /tmp/test_session.json
      return 0
    fi
  fi

  echo "✗ Session creation test failed"
  rm /tmp/test_session.json
  return 1
}

# Run tests
test_create_session
```

## Best Practices for OpenClaw Integration

1. **Stateless Operations**: Each tool invocation is independent
2. **Temporary Files**: Use unique temp file names (e.g., with `$$` or `mktemp`)
3. **Clean Up**: Always remove temporary files after use
4. **Error Propagation**: Check exit codes and forward errors to caller
5. **JSON Validation**: Validate all JSON before passing to CLI
6. **Credential Management**: Never pass credentials as arguments
7. **Idempotency**: Handle duplicate operations gracefully

## Integration with MCP (Alternative)

While this CLI is designed to replace MCP servers, it can also be wrapped in an MCP server if needed:

```javascript
// mcp-klarna-wrapper.js
import { spawn } from 'child_process';

async function callKlarnaCLI(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('klarna', [command, ...args]);
    let output = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(JSON.parse(output));
      } else {
        reject(new Error(output));
      }
    });
  });
}

// MCP tool implementation
export async function createSession(sessionData) {
  const tempFile = `/tmp/session_${Date.now()}.json`;
  await fs.writeFile(tempFile, JSON.stringify(sessionData));

  try {
    const result = await callKlarnaCLI('sessions', ['create', '--file', tempFile]);
    await fs.unlink(tempFile);
    return result;
  } catch (error) {
    await fs.unlink(tempFile);
    throw error;
  }
}
```

## Advantages Over MCP

1. **No Server Process**: CLI runs on-demand, no persistent server
2. **Simpler Debugging**: Use `bash -x` or add `set -x` to see exact commands
3. **Standard Tools**: Compose with grep, sed, awk, jq
4. **Version Control**: Shell scripts are easier to version than server configs
5. **Resource Efficiency**: No memory overhead from persistent server
6. **Portability**: Works in any shell environment

## Conclusion

The Klarna CLI provides a production-ready, OpenClaw-compatible interface to the Klarna Payments API. It's designed for:

- **AI Agents**: Predictable, parseable output
- **Developers**: Standard Unix tool composition
- **Automation**: Shell script integration
- **Simplicity**: No server infrastructure required

For questions or issues, see the main README.md or file an issue on GitHub.
