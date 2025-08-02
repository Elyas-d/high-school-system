# API Documentation

## Overview

The High School Management System API provides RESTful endpoints for managing students, teachers, parents, classes, grades, and materials. All protected endpoints require JWT authentication.

## Base URL

```
http://localhost:3000/api
```

## Authentication

### JWT Token

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login

To obtain a JWT token, use the login endpoint:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher1@example.com",
  "password": "teacher123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "firstName": "John",
    "lastName": "Teacher",
    "email": "teacher1@example.com",
    "role": "TEACHER"
  }
}
```

## Role-Based Access Control

The system supports five user roles with different permissions:

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access |
| **STAFF** | User management, announcements, support |
| **TEACHER** | Material management, grade assignment, class management |
| **STUDENT** | View materials, submit work, view grades |
| **PARENT** | View child's grades and attendance |

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@school.com",
  "password": "password123",
  "role": "STUDENT",
  "phoneNumber": "+1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher1@example.com",
  "password": "teacher123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### User Management

#### List All Users (Admin Only)
```http
GET /api/users
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Admin",
      "lastName": "Staff",
      "email": "admin@example.com",
      "role": "STAFF",
      "phoneNumber": "1000000000"
    }
  ]
}
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <admin-or-staff-token>
```

#### Create User (Admin Only)
```http
POST /api/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@school.com",
  "password": "password123",
  "role": "STUDENT",
  "phoneNumber": "+1234567890"
}
```

#### Update User (Admin Only)
```http
PUT /api/users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+1234567890"
}
```

#### Delete User (Admin Only)
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

### Student Management

#### List All Students
```http
GET /api/students
Authorization: Bearer <admin-teacher-staff-token>
```

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of students per page
- `gradeLevel` (optional): Filter by grade level ID
- `classId` (optional): Filter by class ID
- `search` (optional): Search by name or email

#### Get Student by ID
```http
GET /api/students/:id
Authorization: Bearer <admin-teacher-staff-token>
```

#### Create Student (Admin Only)
```http
POST /api/students
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@school.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "gradeLevelId": 1,
  "classId": 1
}
```

### Teacher Management

#### List All Teachers (Admin Only)
```http
GET /api/teachers
Authorization: Bearer <admin-token>
```

#### Get Teacher by ID
```http
GET /api/teachers/:id
Authorization: Bearer <admin-teacher-token>
```

#### Create Teacher (Admin Only)
```http
POST /api/teachers
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "firstName": "Bob",
  "lastName": "Wilson",
  "email": "bob.wilson@school.com",
  "password": "password123",
  "phoneNumber": "+1234567890"
}
```

### Class Management

#### List All Classes
```http
GET /api/classes
Authorization: Bearer <admin-staff-token>
```

#### Get Class by ID
```http
GET /api/classes/:id
Authorization: Bearer <admin-staff-teacher-token>
```

#### Create Class (Admin Only)
```http
POST /api/classes
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "subjectId": 1,
  "teacherId": 1,
  "schedule": "Mon-Fri 9:00-10:00",
  "roomNumber": "102"
}
```

#### Assign Teacher to Class
```http
POST /api/classes/:id/assign-teacher
Authorization: Bearer <admin-teacher-token>
Content-Type: application/json

{
  "teacherId": 2
}
```

### Grade Management

#### Assign Grade (Admin/Teacher)
```http
POST /api/grades
Authorization: Bearer <admin-teacher-token>
Content-Type: application/json

{
  "studentId": 1,
  "classId": 1,
  "term": "Midterm",
  "score": 85.5
}
```

#### Get Grades by Student
```http
GET /api/grades/student/:studentId
Authorization: Bearer <admin-teacher-parent-token>
```

#### Get Grades by Class
```http
GET /api/grades/class/:classId
Authorization: Bearer <admin-teacher-token>
```

### Material Management

#### List Materials (Teacher/Student)
```http
GET /api/materials
Authorization: Bearer <teacher-student-token>
```

#### Create Material (Teacher Only)
```http
POST /api/materials
Authorization: Bearer <teacher-token>
Content-Type: application/json

{
  "title": "Algebra Chapter 1",
  "description": "Introduction to algebraic expressions",
  "fileUrl": "https://example.com/algebra-ch1.pdf",
  "subjectId": 1
}
```

#### Update Material (Teacher Only)
```http
PUT /api/materials/:id
Authorization: Bearer <teacher-token>
Content-Type: application/json

{
  "title": "Algebra Chapter 1 - Updated",
  "description": "Updated introduction to algebraic expressions"
}
```

#### Delete Material (Teacher Only)
```http
DELETE /api/materials/:id
Authorization: Bearer <teacher-token>
```

### Parent Management

#### Link Parent to Student (Admin Only)
```http
POST /api/parents/link
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "parentId": 3,
  "studentId": 4
}
```

#### View Child Grades (Admin/Parent)
```http
GET /api/parents/:id/grades
Authorization: Bearer <admin-parent-token>
```

#### View Child Attendance (Admin/Parent)
```http
GET /api/parents/:id/attendance
Authorization: Bearer <admin-parent-token>
```

## Error Responses

### Authentication Error (401)
```json
{
  "status": 401,
  "message": "Unauthorized: Missing or malformed Authorization header",
  "timestamp": "2025-08-02T10:18:36.064Z"
}
```

### Authorization Error (403)
```json
{
  "status": 403,
  "message": "Forbidden: User role 'STUDENT' is not allowed to access this resource",
  "timestamp": "2025-08-02T10:18:36.064Z"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "User not found",
  "timestamp": "2025-08-02T10:18:36.064Z"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal Server Error",
  "timestamp": "2025-08-02T10:18:36.064Z"
}
```

## Pagination

For list endpoints that support pagination, use query parameters:

```http
GET /api/students?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## Filtering and Search

Many list endpoints support filtering and search:

```http
GET /api/students?gradeLevel=1&search=john
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Testing

You can test the API using the provided test users:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | STAFF |
| teacher1@example.com | teacher123 | TEACHER |
| parent1@example.com | parent123 | PARENT |
| student1@example.com | student123 | STUDENT |

## Swagger Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api-docs
```

This provides a web interface for testing all endpoints directly from your browser. 