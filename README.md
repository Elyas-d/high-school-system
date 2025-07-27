# High School System Backend

A clean, modular Express.js backend built with TypeScript.

## Features

- 🚀 Express.js with TypeScript
- 📁 Clean, modular folder structure
- 🔧 ESLint + Prettier configuration
- 🛡️ Security middleware (Helmet, CORS)
- ⚡ Environment variable support
- 🐛 Error handling middleware
- 📝 Strict TypeScript configuration

## Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # Route definitions
├── models/          # Data models
├── middlewares/     # Custom middleware
├── utils/           # Utility functions
├── config/          # Configuration
└── index.ts         # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

### API Endpoints

- `GET /api/ping` - Health check endpoint

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
```

## Development

The project uses:

- **TypeScript** with strict mode enabled
- **ESLint** for code linting
- **Prettier** for code formatting
- **Express Router** for route management
- **Helmet** for security headers
- **CORS** for cross-origin requests

## License

MIT 