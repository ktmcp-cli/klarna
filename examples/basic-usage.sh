#!/bin/bash
# Basic usage examples for Klarna CLI

set -e  # Exit on error

echo "=== Klarna CLI Basic Usage Examples ==="
echo ""

# Check if credentials are set
if [ -z "$KLARNA_USERNAME" ] || [ -z "$KLARNA_PASSWORD" ]; then
  echo "Error: KLARNA_USERNAME and KLARNA_PASSWORD must be set"
  echo "Set them in your environment or use:"
  echo "  klarna config set username YOUR_USERNAME"
  echo "  klarna config set password YOUR_PASSWORD"
  exit 1
fi

# Example 1: Create a simple session
echo "Example 1: Creating a payment session"
echo "--------------------------------------"

cat > /tmp/klarna_session_example.json << 'EOF'
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
  ]
}
EOF

SESSION_RESPONSE=$(klarna sessions create --file /tmp/klarna_session_example.json)
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.session_id')
CLIENT_TOKEN=$(echo "$SESSION_RESPONSE" | jq -r '.client_token')

echo "✓ Session created successfully"
echo "  Session ID: $SESSION_ID"
echo "  Client Token: $CLIENT_TOKEN"
echo ""

# Example 2: Retrieve session details
echo "Example 2: Retrieving session details"
echo "--------------------------------------"

SESSION_DETAILS=$(klarna sessions get "$SESSION_ID")
echo "$SESSION_DETAILS" | jq '.'
echo ""

# Example 3: Update session
echo "Example 3: Updating session"
echo "--------------------------------------"

cat > /tmp/klarna_update_example.json << 'EOF'
{
  "order_amount": 15000,
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
    },
    {
      "type": "physical",
      "name": "Blue Cap",
      "quantity": 1,
      "unit_price": 5000,
      "tax_rate": 0,
      "total_amount": 5000,
      "total_tax_amount": 0
    }
  ]
}
EOF

klarna sessions update "$SESSION_ID" --file /tmp/klarna_update_example.json
echo "✓ Session updated successfully"
echo ""

# Cleanup
rm /tmp/klarna_session_example.json /tmp/klarna_update_example.json

echo "=== Examples completed ==="
echo ""
echo "Note: In a real payment flow, you would:"
echo "  1. Create a session"
echo "  2. Send client_token to your frontend"
echo "  3. Customer completes payment (frontend)"
echo "  4. Receive authorization token"
echo "  5. Create order: klarna orders create AUTH_TOKEN --file order.json"
