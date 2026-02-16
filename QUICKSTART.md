# Klarna CLI - Quick Start Guide

Get up and running with the Klarna Payments API CLI in 5 minutes.

## Installation (30 seconds)

```bash
# Navigate to the CLI directory
cd /path/to/klarna-cli

# Run installation script
./install.sh

# Or manual installation
npm install
npm link
```

## Configuration (1 minute)

### Option 1: Environment Variables (Recommended)
```bash
export KLARNA_USERNAME="your_username"
export KLARNA_PASSWORD="your_password"
export KLARNA_REGION="eu"  # or na, oc
```

### Option 2: CLI Config
```bash
klarna config set username your_username
klarna config set password your_password
klarna config set region eu
```

### Option 3: .env File
```bash
cp .env.example .env
# Edit .env with your credentials
```

## Verify Setup (10 seconds)

```bash
klarna config show
```

You should see your username and that password is set.

## Your First API Call (30 seconds)

```bash
# Create a payment session for $100 USD
klarna sessions create --file examples/session.json
```

Expected output:
```
✓ Session created successfully

Session ID: abc-123-def-456
Client Token: eyJhbGciOiJIUzI1NiIs...
```

## Common Use Cases

### 1. Create Payment Session

```bash
klarna sessions create --file examples/session.json
```

### 2. Get Session Details

```bash
klarna sessions get SESSION_ID
```

### 3. Update Session

```bash
klarna sessions update SESSION_ID --file examples/session-with-multiple-items.json
```

### 4. Create Order (after payment)

```bash
# After customer completes payment and you receive auth token
klarna orders create AUTH_TOKEN --file examples/order.json
```

### 5. Cancel Authorization

```bash
klarna authorizations cancel AUTH_TOKEN
```

## Quick JSON Examples

### Minimal Session
```json
{
  "order_amount": 10000,
  "purchase_country": "US",
  "purchase_currency": "USD",
  "order_lines": [
    {
      "name": "Product Name",
      "quantity": 1,
      "unit_price": 10000,
      "total_amount": 10000
    }
  ]
}
```

### Complete Session with Address
```json
{
  "order_amount": 10000,
  "purchase_country": "US",
  "purchase_currency": "USD",
  "order_lines": [
    {
      "type": "physical",
      "name": "Red T-Shirt",
      "quantity": 1,
      "unit_price": 10000,
      "tax_rate": 0,
      "total_amount": 10000,
      "total_tax_amount": 0
    }
  ],
  "billing_address": {
    "given_name": "John",
    "family_name": "Doe",
    "email": "john@example.com",
    "street_address": "123 Main St",
    "postal_code": "12345",
    "city": "New York",
    "region": "NY",
    "phone": "+15551234567",
    "country": "US"
  }
}
```

## Using with Shell Scripts

```bash
#!/bin/bash

# Create session and extract session ID
SESSION_RESPONSE=$(klarna sessions create --file session.json)
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.session_id')

echo "Created session: $SESSION_ID"

# Use session ID for further operations
klarna sessions get "$SESSION_ID"
```

## Using with jq (JSON Processing)

```bash
# Extract just the session ID
klarna sessions create --file examples/session.json | jq -r '.session_id'

# Extract multiple fields
klarna sessions get SESSION_ID | jq '{id: .session_id, amount: .order_amount}'

# Check if session is expired
klarna sessions get SESSION_ID | jq '.expires_at'
```

## Important Notes

### Amounts in Minor Units
Klarna uses minor units (cents, pence, öre):
- $100.00 USD = `10000` (cents)
- €50.00 EUR = `5000` (cents)
- £25.50 GBP = `2550` (pence)

### Country Codes
Use ISO 3166-1 alpha-2 codes:
- US, CA, GB, DE, FR, SE, NO, DK, FI, AU, NZ, etc.

### Currency Codes
Use ISO 4217 codes:
- USD, CAD, GBP, EUR, SEK, NOK, DKK, AUD, NZD, etc.

### Payment Flow
1. Create session → Get `session_id` and `client_token`
2. Send `client_token` to frontend
3. Customer completes payment (in your frontend)
4. Receive `authorization_token` from Klarna
5. Create order with `authorization_token`

## Troubleshooting

### "Authentication credentials not found"
```bash
# Set credentials
export KLARNA_USERNAME="your_username"
export KLARNA_PASSWORD="your_password"

# Or use config
klarna config set username your_username
klarna config set password your_password
```

### "Command not found: klarna"
```bash
# Re-link the CLI
npm link
```

### "Invalid JSON"
```bash
# Validate your JSON first
cat session.json | jq empty
```

### "Session not found (404)"
- Sessions expire after a period
- Verify the session ID is correct
- Create a new session if expired

### "Region/Network Issues"
```bash
# Try different region
klarna sessions create --file session.json --region na

# Increase timeout
klarna config set timeout 60000
```

## Getting Help

```bash
# General help
klarna --help

# Command-specific help
klarna sessions --help
klarna sessions create --help

# Show current config
klarna config show
```

## Next Steps

1. **Read the full README**: `README.md` for complete documentation
2. **AI Agent Integration**: See `AGENT.md` for AI usage patterns
3. **OpenClaw Setup**: See `OPENCLAW.md` for tool definitions
4. **Examples**: Check `examples/` directory for more samples
5. **API Documentation**: Visit https://docs.klarna.com/api/payments/

## Example Workflow Script

```bash
#!/bin/bash
set -e

echo "Creating payment session..."
SESSION=$(klarna sessions create --file examples/session.json)
SESSION_ID=$(echo "$SESSION" | jq -r '.session_id')
CLIENT_TOKEN=$(echo "$SESSION" | jq -r '.client_token')

echo "Session ID: $SESSION_ID"
echo "Client Token: $CLIENT_TOKEN"

echo ""
echo "Next steps:"
echo "1. Send client_token to your frontend"
echo "2. Customer completes payment"
echo "3. Run: klarna orders create AUTH_TOKEN --file examples/order.json"
```

Save as `payment-flow.sh`, make executable (`chmod +x payment-flow.sh`), and run!

## Ready to Build?

You're all set! Start integrating Klarna payments into your application.

For production use:
- Use test credentials in development
- Use production credentials in production
- Set appropriate timeouts
- Handle errors gracefully
- Log all transactions

Happy coding! 🚀
