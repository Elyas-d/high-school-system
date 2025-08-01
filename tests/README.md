# End-to-End (E2E) Testing Guide

This directory contains comprehensive end-to-end tests for the High School Management System API using Jest and Supertest.

## 🏗️ Test Structure

```
tests/
├── setup.ts                 # Global test setup and teardown
├── utils/
│   └── test-utils.ts        # Test utility functions and helpers
├── auth.e2e.test.ts         # Authentication endpoint tests
├── students.e2e.test.ts     # Student management endpoint tests
├── run-tests.ts             # Test runner script
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Test Database**: Ensure you have a separate test database configured
2. **Environment Variables**: Copy `.env.test.example` to `.env.test` and configure
3. **Dependencies**: All testing dependencies are already installed

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test files
npm run test:auth
npm run test:students

# Run tests in watch mode
npm run test:e2e:watch

# Run with coverage
npm run test:coverage

# Run the test runner script (includes database setup)
npx ts-node tests/run-tests.ts
```

## 📋 Test Coverage

### Authentication Tests (`auth.e2e.test.ts`)

- ✅ **Login Endpoint** (`POST /api/auth/login`)
  - Successful login with valid credentials
  - Failed login with invalid email/password
  - Validation errors for missing fields
  - Invalid email format handling

- ✅ **Registration Endpoint** (`POST /api/auth/register`)
  - Successful user registration
  - Duplicate email handling
  - Validation errors for invalid data
  - Password strength validation

- ✅ **User Profile** (`GET /api/auth/me`)
  - Authenticated user profile retrieval
  - Unauthorized access handling
  - Invalid/expired token handling

- ✅ **Logout Endpoint** (`POST /api/auth/logout`)
  - Successful logout
  - Unauthorized logout handling

- ✅ **Token Refresh** (`POST /api/auth/refresh`)
  - Token refresh functionality
  - Invalid token handling

### Student Management Tests (`students.e2e.test.ts`)

- ✅ **List Students** (`GET /api/students`)
  - Role-based access control (ADMIN, TEACHER, STAFF allowed)
  - Unauthorized access (STUDENT, PARENT denied)
  - Pagination support
  - Authentication requirements

- ✅ **Get Student by ID** (`GET /api/students/:id`)
  - Successful student retrieval
  - Non-existent student handling
  - Authentication requirements

- ✅ **Create Student** (`POST /api/students`)
  - ADMIN can create students
  - TEACHER cannot create students
  - Validation of required fields
  - Duplicate student ID prevention

- ✅ **Update Student** (`PUT /api/students/:id`)
  - ADMIN can update students
  - TEACHER cannot update students
  - Non-existent student handling

- ✅ **Delete Student** (`DELETE /api/students/:id`)
  - ADMIN can delete students
  - TEACHER cannot delete students
  - Non-existent student handling

- ✅ **Assign Parent** (`POST /api/students/:id/assign-parent`)
  - ADMIN can assign parents
  - TEACHER cannot assign parents
  - Invalid parent ID validation

## 🛠️ Test Utilities

### TestUtils Class

The `TestUtils` class provides helper methods for common testing operations:

```typescript
// Database cleanup
await TestUtils.cleanupDatabase();

// Create test users
const user = await TestUtils.createTestUser(UserRole.ADMIN, 'admin@test.com');

// Create test students with full relationships
const student = await TestUtils.createTestStudent();

// Generate JWT tokens
const token = TestUtils.generateToken(user);

// Create authenticated request headers
const headers = TestUtils.createAuthHeaders(token);

// Validate response structures
TestUtils.validateResponseStructure(response, 200);
TestUtils.validateErrorResponse(response, 400, 'VALIDATION_ERROR');
```

### Test Environment

- **Database**: Separate test database to avoid affecting development data
- **Port**: Tests run on port 3001 (different from dev server)
- **Logging**: Suppressed during tests for cleaner output
- **Timeout**: 30 seconds per test for E2E operations

## 🔧 Configuration

### Jest Configuration (`jest.config.ts`)

- TypeScript support with `ts-jest`
- Test timeout: 30 seconds
- Coverage reporting
- Test file patterns: `**/*.e2e.test.ts`
- Setup file: `tests/setup.ts`

### Environment Variables (`.env.test`)

```env
NODE_ENV=test
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/high_school_test
JWT_SECRET=test-jwt-secret-key-for-testing-only
SESSION_SECRET=test-session-secret
LOG_LEVEL=error
```

## 📊 Test Data Management

### Database Cleanup

Tests automatically clean up the database:
- **Before all tests**: Complete database cleanup
- **Before each test**: Clean slate for isolated testing
- **After all tests**: Final cleanup

### Test Data Creation

Each test creates its own test data to ensure isolation:
- Users with different roles
- Students with grade levels and classes
- Teachers with subjects
- Parents with relationships

## 🎯 Best Practices

### Test Isolation

- Each test is completely independent
- No shared state between tests
- Database is cleaned between tests

### Realistic Testing

- Tests use real database operations
- No mocking of core services
- Full request/response lifecycle testing

### Error Handling

- Comprehensive error scenario testing
- Validation of error response structures
- Proper HTTP status code verification

### Role-Based Access

- Tests verify RBAC (Role-Based Access Control)
- Each role's permissions are validated
- Unauthorized access is properly tested

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure test database exists and is accessible
   - Check `.env.test` configuration
   - Verify PostgreSQL is running

2. **Port Already in Use**
   - Tests use port 3001, ensure it's available
   - Kill any processes using the test port

3. **Test Timeouts**
   - Increase timeout in `jest.config.ts` if needed
   - Check database performance

4. **Authentication Failures**
   - Verify JWT secret in `.env.test`
   - Check token generation logic

### Debug Mode

Run tests with verbose output:
```bash
npm run test:e2e -- --verbose
```

### Database Inspection

Connect to test database to inspect data:
```bash
npx prisma studio --schema=prisma/schema.prisma
```

## 📈 Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: |
    npm run test:e2e
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
    JWT_SECRET: ${{ secrets.TEST_JWT_SECRET }}
```

## 🔄 Adding New Tests

1. Create new test file: `tests/feature.e2e.test.ts`
2. Follow the existing test structure
3. Use `TestUtils` for common operations
4. Add test scripts to `package.json`
5. Update this README with new test coverage 