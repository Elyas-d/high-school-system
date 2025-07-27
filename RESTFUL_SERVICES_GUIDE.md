# RESTful Services Implementation Guide

## Overview
This document provides a comprehensive guide to the RESTful services implemented for the High School Management System, following the Service-Oriented + MVC pattern.

## Architecture Pattern

### 🏗️ Service-Oriented + MVC Pattern
- **Models**: Prisma-backed database models
- **Services**: Business logic and data access layer
- **Controllers**: Request/response handling
- **Routes**: Endpoint definitions with middleware

### 📁 Module Structure
```
src/modules/
├── user/
│   ├── user.service.ts
│   ├── user.controller.ts
│   └── user.routes.ts
├── student/
│   ├── student.service.ts
│   ├── student.controller.ts
│   └── student.routes.ts
└── [other modules]/
```

## Implemented Modules

### 1. User Module ✅

#### Service Features:
- **CRUD Operations**: Create, Read, Update, Delete users
- **Pagination**: Page-based results with configurable limits
- **Search**: Full-text search across name and email
- **Role Filtering**: Filter users by role
- **Statistics**: User count by role
- **Related Data**: Include role-specific related data

#### Controller Endpoints:
```http
GET    /api/users                    # Get all users (Admin only)
GET    /api/users/:id               # Get user by ID
POST   /api/users                   # Create new user (Admin only)
PUT    /api/users/:id               # Update user by ID
DELETE /api/users/:id               # Delete user by ID (Admin only)
GET    /api/users/role/:role        # Get users by role
GET    /api/users/search            # Search users
GET    /api/users/stats             # Get user statistics (Admin only)
GET    /api/users/profile           # Get current user profile
PUT    /api/users/profile           # Update current user profile
```

#### Authentication & Authorization:
- **Admin Only**: User management, statistics
- **Admin/Staff**: User viewing, search
- **All Authenticated**: Profile management

### 2. Student Module ✅

#### Service Features:
- **CRUD Operations**: Complete student management
- **Advanced Filtering**: By grade level, class, search terms
- **Related Data**: Grades, attendance, submissions, parents
- **Statistics**: Student distribution by grade level
- **Validation**: User role validation, grade level/class existence

#### Controller Endpoints:
```http
GET    /api/students                    # Get all students
GET    /api/students/:id               # Get student by ID
POST   /api/students                   # Create new student
PUT    /api/students/:id               # Update student by ID
DELETE /api/students/:id               # Delete student by ID
GET    /api/students/grade-level/:id   # Get students by grade level
GET    /api/students/class/:id         # Get students by class
GET    /api/students/search            # Search students
GET    /api/students/stats             # Get student statistics
GET    /api/students/profile           # Get current student profile
```

#### Authentication & Authorization:
- **Admin Only**: Student creation, updates, deletion
- **Admin/Staff/Teacher**: Student viewing, search
- **Student**: Own profile access

## Common Features Across Modules

### 🔐 Authentication & Authorization
```typescript
// Authentication middleware
authenticateToken

// Role-based authorization
requireAdmin
requireAdminOrStaff
requireTeacher
requireStudent
requireParent
requireStaff
```

### 📊 Pagination Support
```typescript
interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  // Module-specific filters
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 🔍 Search & Filtering
- **Full-text search** across relevant fields
- **Role-based filtering** for user management
- **Grade level filtering** for students
- **Class-based filtering** for academic data

### 📈 Statistics & Analytics
- **User statistics**: Count by role
- **Student statistics**: Distribution by grade level
- **Performance metrics**: Attendance, grades, submissions

### 🛡️ Error Handling
```typescript
// Standardized error responses
{
  success: false,
  message: "Descriptive error message"
}

// HTTP Status Codes
200 - Success
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
409 - Conflict
500 - Internal Server Error
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Security Features

### 🔒 Role-Based Access Control
- **Admin**: Full system access
- **Staff**: Administrative functions
- **Teacher**: Class and student management
- **Student**: Own data access
- **Parent**: Child-related data access

### 🛡️ Data Protection
- **Password exclusion**: Never return passwords in responses
- **Selective data**: Include only necessary fields
- **Validation**: Input validation and sanitization
- **Cascade deletes**: Proper cleanup of related data

## Database Integration

### 📊 Prisma Integration
```typescript
// Service layer database operations
const users = await prisma.user.findMany({
  where: { /* filters */ },
  include: { /* related data */ },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { /* sorting */ }
});
```

### 🔗 Relationship Handling
- **One-to-One**: User ↔ Student/Parent/Teacher/Staff
- **One-to-Many**: Class → Students, Teacher → Classes
- **Many-to-Many**: Parents ↔ Students (via ParentStudent)

## Testing Examples

### User Management
```bash
# Get all users (Admin only)
curl -X GET "http://localhost:3000/api/users" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Create new user
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "securepassword",
    "role": "STUDENT"
  }'

# Search users
curl -X GET "http://localhost:3000/api/users/search?q=john" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Student Management
```bash
# Get all students
curl -X GET "http://localhost:3000/api/students" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Create new student
curl -X POST "http://localhost:3000/api/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": "user_id_here",
    "gradeLevelId": "grade_level_id_here"
  }'

# Get students by grade level
curl -X GET "http://localhost:3000/api/students/grade-level/grade_id" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Best Practices Implemented

### 🏗️ Code Organization
- **Separation of Concerns**: Service, Controller, Routes
- **Modular Structure**: One folder per model
- **Consistent Naming**: RESTful endpoint naming
- **Type Safety**: TypeScript interfaces and types

### 🔒 Security
- **Authentication**: JWT token validation
- **Authorization**: Role-based access control
- **Input Validation**: Request data validation
- **Error Handling**: Comprehensive error responses

### 📊 Performance
- **Pagination**: Efficient data retrieval
- **Selective Queries**: Include only necessary data
- **Indexing**: Database query optimization
- **Caching**: Ready for Redis integration

### 🧪 Maintainability
- **Consistent Patterns**: Similar structure across modules
- **Error Handling**: Standardized error responses
- **Documentation**: Comprehensive API documentation
- **Type Safety**: TypeScript for better development experience

## Next Steps

### 🚀 Remaining Modules to Implement
1. **Parent Module**: Parent management and student associations
2. **Teacher Module**: Teacher profiles and class management
3. **Class Module**: Class creation and management
4. **Subject Module**: Subject management
5. **GradeLevel Module**: Grade level management
6. **Material Module**: Educational materials
7. **Submission Module**: Student submissions
8. **Grade Module**: Grade management
9. **Attendance Module**: Attendance tracking
10. **Announcement Module**: System announcements
11. **Chat Module**: Support chat system
12. **Payment Module**: Payment processing

### 🔧 Enhancement Opportunities
- **Rate Limiting**: API rate limiting
- **Caching**: Redis integration for performance
- **File Upload**: Material file uploads
- **Email Notifications**: Automated notifications
- **Audit Logging**: Activity tracking
- **API Versioning**: Version control for APIs

## Conclusion

The RESTful services implementation provides a solid foundation for the High School Management System with:

- ✅ **Modular Architecture**: Clean separation of concerns
- ✅ **Security**: Comprehensive authentication and authorization
- ✅ **Scalability**: Pagination and efficient queries
- ✅ **Maintainability**: Consistent patterns and TypeScript
- ✅ **Extensibility**: Easy to add new modules and features

The system is ready for production use with proper environment configuration and database setup. 