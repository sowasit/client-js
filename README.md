# SoWasIt JavaScript Client Library

Official JavaScript/TypeScript client for integrating SoWasIt blockchain into your applications. Create blocks when events happen, store immutable records of your app's actions, and let the SoWasIt dashboard handle verification and management.

**Perfect for:** Recording user actions, transaction logs, audit trails, IoT sensor data, or any immutable event tracking.

**Website:** [sowasit.io](https://sowasit.io)  
**Dashboard:** [app.sowasit.io](https://app.sowasit.io)

---

## 🎯 Integration Guide (Choose Your Stack)

This library works everywhere JavaScript runs. **Pick the option that matches how you work:**

### Option 1: Node.js Project (npm, server-side)
👉 **[Jump to Node.js Setup](#nodejs-setup)**

### Option 2: React or Web Project
👉 **[Jump to React Setup](#react-setup)**

### Option 3: HTML File (no build tools)
👉 **[Jump to Vanilla JS Setup](#vanilla-js-setup)**

---

## Node.js Setup

### Step 1: Create Your Project (if you don't have one)

If you're starting from scratch:

```bash
# Create a new folder
mkdir my-blockchain-app
cd my-blockchain-app

# Initialize a new Node.js project
npm init -y

# Create a simple script file
touch app.js
```

### Step 2: Install the SoWasIt Client

```bash
npm install @sowasit/client-js
```

That's it! The library is now installed.

### Step 3: Get Your API Key & Choose Your Chain

**Create an API key:**
1. Go to [https://app.sowasit.io](https://app.sowasit.io)
2. Create an account and log in
3. In your dashboard, click **"API Keys"**
4. Click **"Create New API Key"**
5. Copy the key (it's shown only once!)

**Create your own chain:**

All users can create their own private chains in the dashboard:
- **Free plan**: 1 private chain included
- **Starter plan**: Up to 5 private chains
- **Pro plan**: Up to 20 private chains
- **Business plan**: Unlimited private chains

You'll pass the chain ID when recording blocks, so you can use different chains for different purposes.

### Step 4: Create a `.env.local` File

Create a file named `.env.local` in your project folder:

```
SOWASIT_API_URL=https://api.sowasit.io
SOWASIT_API_KEY=sk_live_xxxxx
```

That's all you need in `.env`. You'll pass the chain ID in your code.

### Step 5: Integrate Into Your App

The simplest integration: create a block when something happens. Here's a real example:

**Example 1: Record when a user signs up**

```javascript
require('dotenv').config({ path: '.env.local' });
const { SowasitClient } = require('@sowasit/client-js');

const client = new SowasitClient({
  baseUrl: process.env.SOWASIT_API_URL,
  apiKey: process.env.SOWASIT_API_KEY,
});

async function handleUserSignup(email, firstName, lastName) {
  try {
    // Your normal signup logic here...
    console.log(`User signed up: ${email}`);

    // Record it in the blockchain
    // Use your chain ID (from dashboard) or the public chain
    const chainId = 'public-events';  // Or your private chain ID
    
    const block = await client.blocks.create(chainId, {
      event: 'user_signup',
      email: email,
      firstName: firstName,
      lastName: lastName,
    });

    console.log(`✅ Recorded in blockchain: ${block.id}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Call it whenever a user signs up
handleUserSignup('john@example.com', 'John', 'Doe');
```

**Example 2: Record in an Express route**

```javascript
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const app = express();
const { SowasitClient } = require('@sowasit/client-js');

const client = new SowasitClient({
  baseUrl: process.env.SOWASIT_API_URL,
  apiKey: process.env.SOWASIT_API_KEY,
});

app.post('/api/payment', async (req, res) => {
  const { userId, amount } = req.body;

  try {
    // Process payment
    const paymentId = processPayment(userId, amount);

    // Record in blockchain
    // Use your transaction chain ID
    const chainId = 'transactions';  // Your chain ID from dashboard
    
    await client.blocks.create(chainId, {
      type: 'payment',
      userId: userId,
      amount: amount,
      paymentId: paymentId,
      status: 'completed',
    });

    res.json({ success: true, paymentId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

### Step 6: Test It

```bash
npm install dotenv

node app.js
```

You should see:
```
User signed up: john@example.com
✅ Recorded in blockchain: block-xyz...
```

### More Node.js Examples

See the **[`examples/node-basic.js`](examples/node-basic.js)** and **[`examples/node-esm.mjs`](examples/node-esm.mjs)** files for more examples.

---

## React Setup

### Step 1: Create a React Project (if you don't have one)

```bash
npx create-react-app my-blockchain-app
cd my-blockchain-app
```

### Step 2: Install the SoWasIt Client

```bash
npm install @sowasit/client-js
```

### Step 3: Create a `.env.local` File

In your project root, create `.env.local`:

```
REACT_APP_SOWASIT_API_URL=http://localhost:3001
REACT_APP_SOWASIT_API_KEY=your_api_key_here
```

**Note:** In React, environment variables must start with `REACT_APP_`

### Step 4: Create a Hook for Recording Blocks

Create `src/useBlockchain.js`:

```javascript
import { SowasitClient } from '@sowasit/client-js';

const client = new SowasitClient({
  baseUrl: process.env.REACT_APP_SOWASIT_API_URL,
  apiKey: process.env.REACT_APP_SOWASIT_API_KEY,
});

export function useBlockchain() {
  const recordBlock = async (chainId, data) => {
    try {
      const block = await client.blocks.create(chainId, data);
      return block;
    } catch (error) {
      console.error('Blockchain error:', error);
      throw error;
    }
  };

  return { recordBlock };
}
```

### Step 5: Use in Your Components

Example: Record when a form is submitted

```jsx
import { useState } from 'react';
import { useBlockchain } from './useBlockchain';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { recordBlock } = useBlockchain();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Your normal signup logic...
      console.log('Signing up:', email);

      // Record in blockchain
      // Use your chain ID from dashboard or the public chain
      await recordBlock('public-events', {
        event: 'user_signup',
        email: email,
        firstName: firstName,
        lastName: lastName,
      });

      alert('✅ Signup recorded!');
      setEmail('');
      setFirstName('');
      setLastName('');
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

### Step 6: Run Your App

```bash
npm start
```

When a user submits the form, it will be recorded in your blockchain! 🎉

### More React Examples

See **[`examples/browser-react.tsx`](examples/browser-react.tsx)** for a complete interactive example.

---

## Vanilla JS Setup

If you just want to use JavaScript in an HTML file **without npm or build tools**, this is for you.

### Step 1: Download the Pre-Built Library

1. Go to [GitHub Releases](https://github.com/sowasit/client-js/releases)
2. Download the latest `sowasit-client-umd.js` file
3. Save it in your project folder

Or copy this link to use directly from CDN:
```
https://cdn.jsdelivr.net/npm/@sowasit/client-js@latest/dist/umd/sowasit.umd.js
```

### Step 2: Create Your HTML File

The simplest way to add blockchain to your web page:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App with Blockchain</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
    }
    form {
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    input, button {
      display: block;
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      font-size: 14px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    button {
      background: #667eea;
      color: white;
      cursor: pointer;
      border: none;
    }
    button:hover {
      background: #5568d3;
    }
    .message {
      margin-top: 10px;
      padding: 10px;
      border-radius: 4px;
    }
    .success {
      background: #e6ffe6;
      color: #27ae60;
    }
    .error {
      background: #ffe6e6;
      color: #e74c3c;
    }
  </style>
</head>
<body>
  <h1>Join Us!</h1>
  
  <form id="signupForm">
    <input type="text" id="firstName" placeholder="First Name" required />
    <input type="text" id="lastName" placeholder="Last Name" required />
    <input type="email" id="email" placeholder="Email" required />
    <button type="submit">Sign Up</button>
    <div id="message"></div>
  </form>

  <!-- Include the SoWasIt library -->
  <script src="https://cdn.jsdelivr.net/npm/@sowasit/client-js@latest/dist/umd/sowasit.umd.js"></script>

  <script>
    // Initialize the blockchain client
    const API_URL = 'https://api.sowasit.io';
    const API_KEY = 'sk_live_xxxxx';  // Your API key from dashboard

    const client = new window.SoWasIt.SowasitClient({
      baseUrl: API_URL,
      apiKey: API_KEY,
    });

    // Handle form submission
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('email').value;
      const messageDiv = document.getElementById('message');

      try {
        messageDiv.textContent = 'Creating account...';
        messageDiv.className = '';

        // Your normal signup logic here...
        // Then record in blockchain
        // Use your chain ID from dashboard or 'public-events' for free plan
        const chainId = 'public-events';
        
        const block = await client.blocks.create(chainId, {
          event: 'user_signup',
          firstName: firstName,
          lastName: lastName,
          email: email,
        });

        messageDiv.textContent = `✅ Welcome! Your signup was recorded.`;
        messageDiv.className = 'message success';

        // Clear form
        document.getElementById('signupForm').reset();
      } catch (error) {
        messageDiv.textContent = `❌ Error: ${error.message}`;
        messageDiv.className = 'message error';
      }
    });
  </script>
</body>
</html>
```

### Step 3: Configure & Test

1. Update `apiKey` in the script (or use environment variables)
2. Update `baseUrl` if your API is on a different server
3. Update `'user-events-chain'` to your actual chain ID
4. Open the HTML file in your browser
5. Fill out the form and submit

When submitted, it will record the signup in your blockchain! 🎉

### More Vanilla JS Examples

See **[`examples/browser-vanilla.html`](examples/browser-vanilla.html)** for an interactive demo with more features.

---

## 💡 Common Use Cases

### Recording User Actions

Track important actions in your app:

```javascript
async function recordUserAction(chainId, action, details) {
  const block = await client.blocks.create(chainId, {
    action: action,        // e.g., 'user_signup', 'payment_completed'
    userId: details.userId,
    email: details.email,
    amount: details.amount,
    status: 'completed',
  });
  
  console.log(`Action recorded: ${action}`);
  return block;
}

// Usage when a payment is completed
recordUserAction('transactions', 'payment_completed', {
  userId: 'user-123',
  email: 'user@example.com',
  amount: 99.99,
});

// Or use the public chain for free plan
recordUserAction('public-events', 'payment_completed', {
  userId: 'user-123',
  email: 'user@example.com',
  amount: 99.99,
});
```

**Note:** Timestamps are added automatically by the blockchain. You don't need to include them in your data.

**Choosing chains:**
- **Free plan**: Use `'public-events'` - shared read-only chain
- **Paid plan**: Use your own chain IDs created in the dashboard

### Logging Audit Trail

Keep track of all changes to important resources:

```javascript
async function auditLog(chainId, resource, change) {
  await client.blocks.create(chainId, {
    resource_type: resource.type,    // e.g., 'document', 'user_profile'
    resource_id: resource.id,
    changed_by: change.userId,
    action: change.action,            // 'created', 'updated', 'deleted'
    changes: change.details,
  });
}

// Usage when a document is updated
auditLog('audit-trail', 
  { type: 'document', id: 'doc-456' },
  { userId: 'user-789', action: 'updated', details: { title: 'New Title' } }
);
```

### Storing Sensor/IoT Data

Record continuous data streams immutably:

```javascript
async function recordSensorReading(chainId, sensorData) {
  await client.blocks.create(chainId, {
    sensor_id: sensorData.id,
    sensor_name: sensorData.name,
    temperature: sensorData.temp,
    humidity: sensorData.humidity,
    pressure: sensorData.pressure,
    location: sensorData.location,
  });
}

// Called when sensor data arrives
recordSensorReading('iot-sensors', {
  id: 'sensor-001',
  name: 'Office Temperature',
  temp: 22.5,
  humidity: 65,
  pressure: 1013.25,
  location: 'Building A, Floor 2',
});
```

---

## 🔐 Authentication

### Option 1: API Key (for servers/automation)

```javascript
const client = new SowasitClient({
  baseUrl: 'http://localhost:3001',
  apiKey: 'your_api_key_here',
});
```

**Best for:** Backend scripts, automated jobs, CI/CD pipelines

**Get your key:**
1. Log into [sowasit.io](https://sowasit.io)
2. Go to **Settings → API Keys**
3. Click **Create New Key**

### Option 2: Email & Password (for users)

```javascript
const client = new SowasitClient({
  baseUrl: 'http://localhost:3001',
});

// Log in
const response = await client.loginWithEmail(
  'user@example.com',
  'password'
);

console.log('Logged in as:', response.user.email);
// Token is now stored in the client automatically
```

**Best for:** Web apps, user login screens

### Option 3: Register a New Account

```javascript
const response = await client.register(
  'newuser@example.com',
  'secure-password',
  'John',
  'Doe',
  'My Organization'  // optional
);

console.log('Account created!');
console.log('User:', response.user);
console.log('Tenant:', response.tenant);
```

---

## 📖 API Reference

### Creating Blocks (Main Use Case)

```typescript
await client.blocks.create(chainId: string, data: any): Promise<Block>
```

Creates an immutable record of an event. Call this whenever something important happens in your app.

**Parameters:**
- `chainId`: Your chain ID (set up in the SoWasIt dashboard)
- `data`: Any JavaScript object with the event details

**Returns:** Block object with `id`, `hash`, `created_at`, and your `data`

**Example:**
```javascript
const block = await client.blocks.create('my-chain', {
  timestamp: new Date().toISOString(),
  event: 'user_signed_up',
  userId: 'user-123',
  email: 'user@example.com',
});
```

---

### Other Methods

#### Chains
- `await client.chains.get(chainId)` - Get chain details (name, type, etc.)

#### Authentication

**For apps/servers** (recommended): Use API key in `.env`
```javascript
const client = new SowasitClient({
  baseUrl: process.env.SOWASIT_API_URL,
  apiKey: process.env.SOWASIT_API_KEY,  // Use this for server/app integration
});
```

**For web app user login** (optional): Use email/password
```javascript
// Only available in web apps, creates user session
await client.loginWithEmail(email, password);
await client.register(email, password, firstName, lastName, tenantName);
```

#### Utility
- `await client.health()` - Check if API is running

---

## 🆓 Free vs Paid Plans

**Free Plan:**
- Use the shared public chain: `'public-events'`
- You can write to it, and everyone can verify the immutability of the chain
- Perfect for: Testing, low-volume projects, or immutability verification

**Paid Plan:**
- Create unlimited private chains in the dashboard
- Only you (and users you invite) can see your data
- Use your chain IDs: `'my-app-events'`, `'transactions'`, `'audit-logs'`, etc.
- Perfect for: Production apps, sensitive data, enterprise deployments

**To upgrade:** Visit [https://app.sowasit.io](https://app.sowasit.io) → Billing

---

## 🐛 Troubleshooting

### "Connection refused" Error

**Problem:** Can't connect to the API

**Solutions:**
1. Check your API URL is correct (usually `http://localhost:3001`)
2. Make sure the API server is running
3. Check that there's no firewall blocking the connection

### "Invalid API key" Error

**Problem:** API key not working

**Solutions:**
1. Check you copied the full API key correctly
2. Make sure the key hasn't expired (check in dashboard)
3. Create a new API key in your dashboard

### "Unauthorized" Error

**Problem:** You're not logged in or token expired

**Solutions:**
1. Log in again: `await client.loginWithEmail(...)`
2. Or provide your API key when creating the client
3. Check that your token hasn't expired

### CORS Errors (Web/React)

**Problem:** Browser blocking requests to API

**This is normal during local development.** Solutions:
1. Run API and web app on same origin
2. Or configure CORS on your API server
3. Or use a CORS proxy (for testing only)

---

## 📦 Package Contents

```
libs/js/
├── src/                    # TypeScript source code
│   ├── client.ts          # Main SowasitClient class
│   ├── types.ts           # TypeScript types
│   └── index.ts           # Exports
├── dist/                  # Pre-built for all targets
│   ├── cjs/              # For Node.js (CommonJS)
│   ├── esm/              # For Node.js (ES Modules)
│   └── umd/              # For browsers
├── examples/             # Working examples
│   ├── node-basic.js
│   ├── node-esm.mjs
│   ├── browser-vanilla.html
│   └── browser-react.tsx
├── package.json
├── tsconfig.json
└── build.js             # Build script
```

---

## 🏗️ Building from Source

If you want to build the library yourself:

```bash
# Install dependencies
npm install

# Build for all targets (cjs, esm, umd)
npm run build

# Watch for changes during development
npm run build:watch

# Type checking
npm run type-check

# Clean build files
npm run clean
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 💬 Support

- **Docs:** [docs.sowasit.io](https://docs.sowasit.io)
- **Discord:** [discord.gg/sowasit](https://discord.gg/sowasit)
- **Issues:** [GitHub Issues](https://github.com/sowasit/client-js/issues)

---

**Made with ❤️ by the SoWasIt Team**
