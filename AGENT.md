# Klarna CLI - AI Agent Usage Guide

This guide helps AI agents (like Claude, GPT-4, etc.) effectively use the Klarna Payments API CLI.

## Quick Reference for AI Agents

### Key Commands
```bash
# Sessions
klarna sessions create --file session.json
klarna sessions get <session_id>
klarna sessions update <session_id> --file updated.json

# Orders
klarna orders create <auth_token> --file order.json

# Authorizations
klarna authorizations cancel <auth_token>
klarna authorizations customer-token <auth_token>

# Configuration
klarna config show
klarna config set <key> <value>
```

## AI Agent Best Practices

### 1. Always Validate JSON Before Calling

Before executing commands, validate that JSON data contains required fields:

**Required for Sessions:**
- `order_amount` (integer, amount in minor units)
- `purchase_country` (string, ISO 3166 alpha-2)
- `purchase_currency` (string, ISO 4217)
- `order_lines` (array, at least one item)

**Order Line Required Fields:**
- `name` (string)
- `quantity` (integer)
- `unit_price` (integer)
- `total_amount` (integer)

### 2. Use Files for Complex Data

Instead of passing large JSON strings via `--data`, write to a temporary file:

```bash
# Write JSON to file
cat > /tmp/session.json << 'EOF'
{
  "order_amount": 10000,
  "purchase_country": "US",
  "purchase_currency": "USD",
  "order_lines": [...]
}
EOF

# Use file in command
klarna sessions create --file /tmp/session.json
```

### 3. Parse JSON Responses

Use `jq` to extract specific fields from responses:

```bash
# Get session ID
SESSION_ID=$(klarna sessions create --file session.json | jq -r '.session_id')

# Get client token
CLIENT_TOKEN=$(klarna sessions get $SESSION_ID | jq -r '.client_token')

# Check if order creation succeeded
ORDER_ID=$(klarna orders create $AUTH_TOKEN --file order.json | jq -r '.order_id')
if [ -n "$ORDER_ID" ]; then
  echo "Order created: $ORDER_ID"
fi
```

### 4. Handle Errors Gracefully

Check exit codes and capture error output:

```bash
if output=$(klarna sessions create --file session.json 2>&1); then
  echo "Success: $output"
else
  echo "Error occurred: $output"
  # Parse error message and suggest fixes
fi
```

### 5. Use Verbose Mode for Debugging

When troubleshooting, enable verbose output:

```bash
klarna sessions create --file session.json -v
```

## Common Workflows for AI Agents

### Workflow 1: Create Payment Session

```bash
# Step 1: Prepare session data
cat > /tmp/klarna_session.json << 'EOF'
{
  "order_amount": 10000,
  "purchase_country": "US",
  "purchase_currency": "USD",
  "order_lines": [
    {
      "type": "physical",
      "name": "Product Name",
      "quantity": 1,
      "unit_price": 10000,
      "total_amount": 10000,
      "tax_rate": 0,
      "total_tax_amount": 0
    }
  ]
}
EOF

# Step 2: Create session
RESULT=$(klarna sessions create --file /tmp/klarna_session.json)

# Step 3: Extract session ID
SESSION_ID=$(echo "$RESULT" | jq -r '.session_id')
echo "Created session: $SESSION_ID"

# Step 4: Clean up
rm /tmp/klarna_session.json
```

### Workflow 2: Complete Order from Authorization

```bash
# Given: AUTH_TOKEN from frontend

# Step 1: Prepare order data
cat > /tmp/klarna_order.json << 'EOF'
{
  "order_amount": 10000,
  "purchase_country": "US",
  "purchase_currency": "USD",
  "order_lines": [...],
  "merchant_urls": {
    "confirmation": "https://example.com/confirmation",
    "authorization": "https://example.com/authorization"
  }
}
EOF

# Step 2: Create order
ORDER_RESULT=$(klarna orders create "$AUTH_TOKEN" --file /tmp/klarna_order.json)

# Step 3: Extract order ID and status
ORDER_ID=$(echo "$ORDER_RESULT" | jq -r '.order_id')
FRAUD_STATUS=$(echo "$ORDER_RESULT" | jq -r '.fraud_status')

echo "Order created: $ORDER_ID (Fraud status: $FRAUD_STATUS)"

# Step 4: Clean up
rm /tmp/klarna_order.json
```

### Workflow 3: Update Existing Session

```bash
# Given: SESSION_ID from previous creation

# Step 1: Fetch current session
CURRENT=$(klarna sessions get "$SESSION_ID")

# Step 2: Modify data (example: update amount)
UPDATED=$(echo "$CURRENT" | jq '.order_amount = 15000')

# Step 3: Write updated data
echo "$UPDATED" > /tmp/klarna_update.json

# Step 4: Update session
klarna sessions update "$SESSION_ID" --file /tmp/klarna_update.json

# Step 5: Clean up
rm /tmp/klarna_update.json
```

## Amount Handling (Critical for AI Agents)

Klarna uses **minor units** (cents for USD, öre for SEK, etc.):

```bash
# $100.00 USD = 10000 cents
order_amount=10000

# €50.00 EUR = 5000 cents
order_amount=5000

# £25.50 GBP = 2550 pence
order_amount=2550
```

**AI Agent Conversion Logic:**
```python
# Convert dollars to cents
def dollars_to_minor_units(amount_dollars):
    return int(amount_dollars * 100)

# Convert cents to dollars (for display)
def minor_units_to_dollars(amount_cents):
    return amount_cents / 100
```

## Country and Currency Codes

### Supported Countries (ISO 3166-1 alpha-2)
- US, CA (North America)
- GB, DE, FR, SE, NO, DK, FI, NL, AT, BE, CH, IT, ES, PL (Europe)
- AU, NZ (Oceania)

### Currencies (ISO 4217)
- USD, CAD
- GBP, EUR, SEK, NOK, DKK, CHF, PLN
- AUD, NZD

**AI Agent Validation:**
```bash
# Validate country-currency pairing
validate_country_currency() {
  case "$1-$2" in
    US-USD|CA-CAD|GB-GBP|DE-EUR|SE-SEK|AU-AUD|NZ-NZD)
      return 0
      ;;
    *)
      echo "Invalid country-currency combination"
      return 1
      ;;
  esac
}
```

## Error Handling Guide for AI Agents

### Common Errors and Solutions

#### Error: "Authentication credentials not found"
**Cause**: Missing KLARNA_USERNAME or KLARNA_PASSWORD

**Solution**:
```bash
# Check if credentials are set
if [ -z "$KLARNA_USERNAME" ] || [ -z "$KLARNA_PASSWORD" ]; then
  echo "Error: Set KLARNA_USERNAME and KLARNA_PASSWORD"
  exit 1
fi

# Or set them
export KLARNA_USERNAME="your_username"
export KLARNA_PASSWORD="your_password"
```

#### Error: "Missing required fields"
**Cause**: JSON missing required fields

**Solution**: Validate before calling:
```bash
# Validate with jq
if ! jq -e '.order_amount and .purchase_country and .purchase_currency and .order_lines' session.json > /dev/null; then
  echo "Error: Missing required fields in session.json"
  exit 1
fi
```

#### Error: "Constraint violation"
**Cause**: Invalid data (e.g., wrong country code, negative amount)

**Solution**: Validate data types and formats:
```bash
# Check amount is positive integer
if [ "$order_amount" -le 0 ]; then
  echo "Error: order_amount must be positive"
  exit 1
fi

# Check country code format (2 uppercase letters)
if ! [[ "$purchase_country" =~ ^[A-Z]{2}$ ]]; then
  echo "Error: Invalid country code format"
  exit 1
fi
```

#### Error: "Session not found (404)"
**Cause**: Invalid session ID or expired session

**Solution**:
- Verify session ID is correct
- Sessions expire after a period (check API response for expiry)
- Create new session if expired

## Response Parsing Patterns

### Extract Specific Fields
```bash
# Session creation response
RESPONSE=$(klarna sessions create --file session.json)
SESSION_ID=$(echo "$RESPONSE" | jq -r '.session_id')
CLIENT_TOKEN=$(echo "$RESPONSE" | jq -r '.client_token')
EXPIRES_AT=$(echo "$RESPONSE" | jq -r '.expires_at')

# Order creation response
RESPONSE=$(klarna orders create "$AUTH_TOKEN" --file order.json)
ORDER_ID=$(echo "$RESPONSE" | jq -r '.order_id')
FRAUD_STATUS=$(echo "$RESPONSE" | jq -r '.fraud_status')
```

### Check for Errors
```bash
# Check if response contains error
if echo "$RESPONSE" | jq -e '.error_message' > /dev/null; then
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error_message')
  echo "API Error: $ERROR_MSG"
  exit 1
fi
```

### Iterate Over Arrays
```bash
# Extract all order line names
SESSION=$(klarna sessions get "$SESSION_ID")
echo "$SESSION" | jq -r '.order_lines[].name'

# Sum total amounts
TOTAL=$(echo "$SESSION" | jq '[.order_lines[].total_amount] | add')
```

## Testing and Validation

### Pre-flight Checks
```bash
# Check credentials
check_credentials() {
  if ! klarna config show | grep -q "Username:.*[^ ]"; then
    echo "Error: Username not configured"
    return 1
  fi
  if ! klarna config show | grep -q "Password:.*set"; then
    echo "Error: Password not configured"
    return 1
  fi
  return 0
}

# Validate JSON file
validate_json() {
  if ! jq empty "$1" 2>/dev/null; then
    echo "Error: Invalid JSON in $1"
    return 1
  fi
  return 0
}
```

### Dry Run Pattern
```bash
# Validate data without API call
dry_run_session() {
  local file=$1

  # Check file exists
  [ ! -f "$file" ] && echo "File not found: $file" && return 1

  # Validate JSON
  validate_json "$file" || return 1

  # Check required fields
  local required="order_amount purchase_country purchase_currency order_lines"
  for field in $required; do
    if ! jq -e ".$field" "$file" > /dev/null; then
      echo "Missing required field: $field"
      return 1
    fi
  done

  echo "Validation passed"
  return 0
}
```

## Integration with AI Agent Workflows

### Structured Output for Parsing

AI agents should parse structured output:

```bash
# Create session and output JSON for parsing
klarna sessions create --file session.json > /tmp/klarna_response.json

# Agent can now parse the response
SESSION_ID=$(jq -r '.session_id' /tmp/klarna_response.json)
CLIENT_TOKEN=$(jq -r '.client_token' /tmp/klarna_response.json)
```

### Logging for Debugging

```bash
# Log all operations
LOG_FILE="/tmp/klarna_operations.log"

log_operation() {
  echo "[$(date -Iseconds)] $1" >> "$LOG_FILE"
}

# Example usage
log_operation "Creating session with file: session.json"
RESULT=$(klarna sessions create --file session.json)
log_operation "Session created: $(echo $RESULT | jq -r '.session_id')"
```

### Idempotency Considerations

Sessions and orders are NOT idempotent. AI agents should:
- Store session IDs to avoid duplicate creation
- Check if session exists before creating new one
- Use unique merchant references for orders

```bash
# Check if session already exists (store in temp file)
SESSION_CACHE="/tmp/klarna_sessions.txt"

get_or_create_session() {
  local cache_key="$1"

  # Check cache
  if [ -f "$SESSION_CACHE" ]; then
    SESSION_ID=$(grep "^$cache_key:" "$SESSION_CACHE" | cut -d: -f2)
    if [ -n "$SESSION_ID" ]; then
      echo "Using cached session: $SESSION_ID"
      echo "$SESSION_ID"
      return 0
    fi
  fi

  # Create new session
  SESSION_ID=$(klarna sessions create --file session.json | jq -r '.session_id')

  # Cache it
  echo "$cache_key:$SESSION_ID" >> "$SESSION_CACHE"
  echo "$SESSION_ID"
}
```

## Security Best Practices for AI Agents

1. **Never log credentials**: Don't echo or log `KLARNA_USERNAME` or `KLARNA_PASSWORD`
2. **Use environment variables**: Don't pass credentials via `--username` and `--password` flags
3. **Clean up temporary files**: Always remove temp files containing sensitive data
4. **Mask sensitive data in logs**: Redact tokens and customer information

```bash
# Secure temp file creation
create_secure_temp() {
  local temp_file=$(mktemp)
  chmod 600 "$temp_file"  # Only owner can read/write
  echo "$temp_file"
}

# Clean up on exit
trap 'rm -f /tmp/klarna_*.json' EXIT
```

## Performance Optimization

### Batch Operations
```bash
# Process multiple sessions efficiently
while IFS= read -r session_file; do
  klarna sessions create --file "$session_file" &
done < session_files.txt
wait  # Wait for all background jobs
```

### Timeout Handling
```bash
# Set appropriate timeout for slow networks
export KLARNA_TIMEOUT=60000  # 60 seconds

# Or per-command (not yet supported, use config)
klarna config set timeout 60000
```

## Conclusion

This CLI is designed to be AI-agent-friendly with:
- Predictable exit codes (0 = success, 1 = error)
- JSON responses for easy parsing
- Clear error messages for decision making
- Composability with standard Unix tools

AI agents should treat this CLI as a reliable, stateless interface to Klarna's API.
