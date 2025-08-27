# Lotin-Krill Telegram Bot

A Telegram bot that helps users convert text between Latin (Lotin) and Cyrillic (Krill) scripts. Built with Grammy.js and TypeScript, featuring a serverless architecture that can be deployed for **completely free** on Vercel's hobby tier. The serverless design ensures high availability and zero server maintenance.

## 🚀 Features

- Convert text from Latin to Cyrillic script
- Convert text from Cyrillic to Latin script
- Inline mode support for quick conversions
- Google Sheets integration for data storage
- User mode persistence

## 🛠️ Tech Stack

- [Grammy.js](https://grammy.dev/) - Telegram Bot Framework
- TypeScript - Programming Language
- Google Sheets API - Data Storage
- Vercel - Hosting Platform

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (14.x or higher)
- npm or yarn
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Google Cloud Project credentials

## 🔧 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd lotin-krill-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
- BOT_TOKEN: Your Telegram bot token
- CHANNEL_ID: Your channel ID
- Google Cloud credentials
- Spreadsheet configuration

## 💻 Development

To run the bot in development mode:
```bash
npm run dev
```

To build and start in production:
```bash
npm run build
npm start
```

## 📝 Available Scripts

- `npm run dev` - Run in development mode
- `npm run build` - Build the project
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run vercel-build` - Build for Vercel deployment

## 🚀 Deployment

This bot is designed to run on Vercel's free tier with zero hosting costs:

1. Sign up for a free [Vercel account](https://vercel.com/signup)
2. Install Vercel CLI:
```bash
npm i -g vercel
```

3. Deploy to Vercel:
```bash
vercel
```

That's it! Your bot will be deployed and running for free. The serverless architecture ensures you'll never exceed Vercel's generous free tier limits for typical bot usage.

### Setting up Webhook

After deployment, set your bot's webhook to your Vercel deployment URL:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_VERCEL_URL>/api/webhook
```

## 💰 Cost

- **Hosting**: $0 (Free on Vercel)
- **Database**: $0 (Using Google Sheets)
- **Total**: $0/month

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
