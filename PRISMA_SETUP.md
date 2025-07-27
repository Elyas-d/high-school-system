# Prisma Schema Setup Guide

## Overview
This document provides instructions for setting up and using the Prisma schema for the High School Management System.

## Database Models

### Core Models

#### User
- **Purpose**: Central user management for all system users
- **Key Fields**: 
  - `id` (Primary Key)
  - `firstName`, `lastName`, `email` (unique)
  - `phoneNumber`, `password`
  - `role` (enum: ADMIN, STAFF, TEACHER, STUDENT, PARENT)
  - `createdAt`, `updatedAt`

#### Student
- **Purpose**: Represents students in the system
- **Relations**: 
  - Belongs to a User (one-to-one)
  - Belongs to a GradeLevel
  - Can be assigned to a Class
  - Has many Grades, Attendances, Submissions, Payments
  - Can have multiple Parents (many-to-many)

#### Parent
- **Purpose**: Represents parents/guardians
- **Relations**:
  - Belongs to a User (one-to-one)
  - Can have multiple Students (many-to-many)
  - Has many Payments

#### Teacher
- **Purpose**: Represents teachers in the system
- **Relations**:
  - Belongs to a User (one-to-one)
  - Teaches many Classes
  - Creates many Materials

#### Staff
- **Purpose**: Represents administrative staff
- **Relations**:
  - Belongs to a User (one-to-one)

### Academic Models

#### GradeLevel
- **Purpose**: Represents different grade levels (e.g., Grade 9, Grade 10)
- **Fields**: `name`, `description`
- **Relations**: Has many Students and Subjects

#### Subject
- **Purpose**: Represents academic subjects
- **Fields**: `name`, `description`, `gradeLevelId`
- **Relations**: Belongs to a GradeLevel, has many Classes and Materials

#### Class
- **Purpose**: Represents specific class instances
- **Fields**: `subjectId`, `teacherId`, `schedule`, `roomNumber`
- **Relations**: Belongs to a Subject and Teacher, has many Students, Grades, Attendances

#### Grade
- **Purpose**: Tracks student grades for classes
- **Fields**: `studentId`, `classId`, `term`, `score`
- **Relations**: Belongs to a Student and Class
- **Constraints**: Unique combination of student, class, and term

### Content Models

#### Material
- **Purpose**: Educational materials shared by teachers
- **Fields**: `title`, `description`, `fileUrl`, `subjectId`, `createdBy`
- **Relations**: Belongs to a Subject and Teacher, has many Submissions

#### Submission
- **Purpose**: Student submissions for materials
- **Fields**: `studentId`, `materialId`, `submissionDate`, `status`
- **Relations**: Belongs to a Student and Material
- **Constraints**: Unique combination of student and material

### Tracking Models

#### Attendance
- **Purpose**: Tracks student attendance for classes
- **Fields**: `studentId`, `classId`, `date`, `status`
- **Relations**: Belongs to a Student and Class
- **Constraints**: Unique combination of student, class, and date

#### Announcement
- **Purpose**: System announcements created by teachers or staff
- **Fields**: `title`, `content`, `createdAt`, `createdBy`
- **Relations**: Belongs to a User (creator)

### Support Models

#### ChatSupport
- **Purpose**: Support chat messages
- **Fields**: `userId`, `message`, `timestamp`
- **Relations**: Belongs to a User

#### Payment
- **Purpose**: Tracks payments made by parents
- **Fields**: `parentId`, `studentId`, `amount`, `method`, `status`, `timestamp`
- **Relations**: Belongs to a Parent and Student

## Setup Instructions

### 1. Environment Setup
Create a `.env` file in the root directory with your database URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/high_school_db"
```

### 2. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or create and run migrations (for production)
npm run db:migrate
```

### 3. Available Scripts
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio for database management
- `npm run db:seed` - Run database seeding (if seed file exists)

### 4. Using Prisma Client
```typescript
import prisma from '../config/database';

// Example: Create a new user
const user = await prisma.user.create({
  data: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword',
    role: 'STUDENT'
  }
});

// Example: Get student with related data
const student = await prisma.student.findUnique({
  where: { id: 'studentId' },
  include: {
    user: true,
    gradeLevel: true,
    class: true,
    grades: true,
    parents: {
      include: {
        parent: {
          include: {
            user: true
          }
        }
      }
    }
  }
});
```

## Key Features

### Enums
- **UserRole**: ADMIN, STAFF, TEACHER, STUDENT, PARENT
- **AttendanceStatus**: PRESENT, ABSENT, LATE
- **PaymentStatus**: PENDING, COMPLETED, FAILED, CANCELLED
- **SubmissionStatus**: SUBMITTED, GRADED, LATE, MISSING

### Constraints
- Unique email addresses for users
- Unique student-class-term combinations for grades
- Unique student-class-date combinations for attendance
- Unique student-material combinations for submissions
- Unique parent-student combinations for parent relationships

### Cascade Deletes
- When a User is deleted, related Student, Parent, Teacher, or Staff records are deleted
- When a Student is deleted, related grades, attendances, submissions, and payments are deleted
- When a Class is deleted, related grades and attendances are deleted
- When a Material is deleted, related submissions are deleted

## Database Naming Conventions
- All table names use snake_case (e.g., `grade_levels`, `parent_students`)
- All field names use camelCase
- Foreign key fields use the pattern `{modelName}Id`

## Next Steps
1. Set up your PostgreSQL database
2. Configure your `.env` file with the database URL
3. Run `npm run db:push` to create the database tables
4. Start building your API endpoints using the Prisma client 