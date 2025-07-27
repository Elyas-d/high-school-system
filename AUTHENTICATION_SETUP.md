# Authentication System Setup Guide

## Overview
This document provides instructions for setting up and using the authentication system for the High School Management System, including JWT authentication and Google OAuth2 integration.

## Features

### 🔐 JWT Authentication
- **Access Token**: 15-minute expiration
- **Refresh Token**: 7-day expiration (optional)
- **Password Hashing**: Using bcryptjs with 12 salt rounds
- **Token Verification**: Middleware for protecting routes

### 🌐 Google OAuth2
- **Google Sign-In**: Seamless authentication with Google accounts
- **Auto User Creation**: Creates new users from Google profiles
- **Role Assignment**: Defaults to STUDENT role for new OAuth users

### 🛡️ Role-Based Authorization
- **Multiple Roles**: ADMIN, STAFF, TEACHER, STUDENT, PARENT
- **Route Protection**: Middleware for role-based access control
- **Flexible Permissions**: Custom role combinations

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "phoneNumber": "+1234567890",
  "role": "STUDENT"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### OAuth Endpoints

#### Google OAuth Login
```http
GET /api/auth/google
```

#### Google OAuth Callback
```http
GET /api/auth/google/callback
```

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/high_school_db"

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
SESSION_SECRET=your_session_secret_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

### Setting Up Google OAuth

1. **Create Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
   - Set Application Type to "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)

2. **Update Environment Variables**:
   - Copy the Client ID and Client Secret to your `.env` file
   - Update the callback URL to match your setup

## Middleware Usage

### Authentication Middleware

```typescript
import { authenticateToken } from '../middlewares/authMiddleware';

// Protect a route with JWT authentication
router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains the authenticated user info
  res.json({ user: req.user });
});
```

### Role-Based Authorization

```typescript
import { 
  requireAdmin, 
  requireTeacher, 
  requireStudent,
  requireAdminOrStaff 
} from '../middlewares/roleMiddleware';

// Admin only route
router.get('/admin/users', authenticateToken, requireAdmin, adminController.getUsers);

// Teacher or Admin route
router.get('/classes', authenticateToken, requireTeacherOrAdmin, classController.getClasses);

// Student only route
router.get('/grades', authenticateToken, requireStudent, gradeController.getGrades);

// Admin or Staff route
router.get('/reports', authenticateToken, requireAdminOrStaff, reportController.getReports);
```

### Custom Role Combinations

```typescript
import { requireRole } from '../middlewares/roleMiddleware';
import { UserRole } from '@prisma/client';

// Custom role combination
router.get('/special', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TEACHER]), specialController.getData);
```

## Client-Side Integration

### JWT Token Storage

```javascript
// Store tokens after login
const handleLogin = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens securely
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
};
```

### Making Authenticated Requests

```javascript
// Add authorization header to requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Handle token expiration
  if (response.status === 401) {
    await refreshToken();
    // Retry request with new token
  }
  
  return response;
};
```

### Token Refresh

```javascript
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
  } else {
    // Redirect to login
    localStorage.clear();
    window.location.href = '/login';
  }
};
```

## Security Best Practices

### 1. Token Security
- Store tokens in `httpOnly` cookies in production
- Use HTTPS in production
- Implement token rotation
- Set appropriate token expiration times

### 2. Password Security
- Use strong password requirements
- Implement rate limiting for login attempts
- Use bcrypt for password hashing
- Never store plain text passwords

### 3. OAuth Security
- Validate OAuth tokens on the server
- Implement CSRF protection
- Use state parameter for OAuth flows
- Validate redirect URIs

### 4. Environment Security
- Never commit `.env` files to version control
- Use different secrets for different environments
- Rotate secrets regularly
- Use environment-specific configurations

## Error Handling

### Common Error Responses

```json
// Invalid credentials
{
  "success": false,
  "message": "Invalid email or password"
}

// Token expired
{
  "success": false,
  "message": "Token has expired"
}

// Insufficient permissions
{
  "success": false,
  "message": "Insufficient permissions"
}

// Missing token
{
  "success": false,
  "message": "Access token is required"
}
```

## Testing the Authentication

### 1. Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "role": "STUDENT"
  }'
```

### 2. Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Protected Route
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Common Issues

1. **JWT Secret Issues**:
   - Ensure `JWT_SECRET` is set in environment
   - Use a strong, unique secret key

2. **Google OAuth Issues**:
   - Verify Google OAuth credentials are correct
   - Check redirect URI matches exactly
   - Ensure Google+ API is enabled

3. **Database Connection**:
   - Verify `DATABASE_URL` is correct
   - Ensure PostgreSQL is running
   - Run database migrations

4. **CORS Issues**:
   - Configure CORS for your frontend domain
   - Handle preflight requests properly

## Next Steps

1. **Implement Password Reset**: Add forgot password functionality
2. **Add Email Verification**: Verify user email addresses
3. **Implement Rate Limiting**: Prevent brute force attacks
4. **Add Audit Logging**: Track authentication events
5. **Implement Multi-Factor Authentication**: Add 2FA support
6. **Add Social Login Providers**: Facebook, GitHub, etc. 