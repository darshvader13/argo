# Argo

> GenAI-powered financial assistant for managing finances through conversational AI, bank integration, and data visualization.

## Tech Stack

**Frontend**
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- Recharts (charts), Lucide (icons), react-markdown

**Backend**
- AWS Bedrock (Claude 3.5 Sonnet)
- AWS DynamoDB (database)
- AWS S3 (file storage)
- NextAuth.js (Google OAuth)
- Plaid API (bank integration)

## Getting Started

### Prerequisites
- Node.js 18+
- AWS account with Bedrock access
- Google OAuth credentials
- Plaid account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/argo.git
cd argo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0

# Plaid Configuration (Sandbox)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_sandbox_secret
PLAID_ENV=sandbox

# NextAuth Configuration
AUTH_SECRET=your_random_secret_key
AUTH_GOOGLE_ID=your_google_oauth_client_id
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret
NEXTAUTH_URL=http://localhost:3000
```

### Plaid Sandbox Setup

Plaid provides a free sandbox environment for testing without real bank connections.

1. **Sign up for Plaid**
   - Go to [Plaid Dashboard](https://dashboard.plaid.com/signup)
   - Create a free account

2. **Get Sandbox Credentials**
   - Navigate to Team Settings → Keys
   - Copy your `client_id` and `sandbox` secret
   - Add to `.env.local` as shown above

3. **Test with Sandbox Credentials**
   
   When connecting a bank in the app, use these test credentials:
   
   ```
   Username: user_good
   Password: pass_good
   ```
   
   Other test usernames available:
   - `user_good` - Successful authentication
   - `user_custom` - Custom MFA flow
   - `user_pending_auth` - Pending manual review
   
   [Full list of test credentials](https://plaid.com/docs/sandbox/test-credentials/)

4. **Sandbox Limitations**
   - No real bank data
   - Limited to test accounts
   - Free forever
   - Perfect for development


### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
argo/
├── app/
│   ├── api/              # API routes
│   │   ├── chat/         # Claude AI endpoints
│   │   └── plaid/        # Plaid integration
│   ├── components/       # React components
│   ├── dashboard/        # Main dashboard page
│   └── globals.css       # Global styles
├── lib/                  # Utilities
│   ├── conversation.ts   # Chat management
│   ├── user.ts          # User data
│   └── plaid.ts         # Plaid client
└── auth.ts              # NextAuth config
```

## Features

- 💬 **AI Chat** - Claude-powered financial assistant
- 🏦 **Bank Integration** - Secure Plaid connection (sandbox & production)
- 📊 **Data Visualization** - Interactive charts and insights
- 📄 **Document Upload** - Process PDFs and CSVs
- 🔐 **Secure Auth** - Google OAuth with session management

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Lint code
```

## Contributing

Pull requests welcome! Please open an issue first to discuss major changes.



---

**Built with:** Next.js • Claude AI • Plaid • AWS
