# High School Management System Backend

A clean, modular Express.js backend built with JavaScript, Sequelize ORM, and MySQL database.

## Features

- 🚀 Express.js with JavaScript
- 🗄️ Sequelize ORM with MySQL
- 🛡️ Role-based access control (RBAC)
- 🔐 JWT Authentication
- 📁 Clean, modular folder structure
- 🔧 ESLint + Prettier configuration
- 🛡️ Security middleware (Helmet, CORS)
- ⚡ Environment variable support
- 🐛 Error handling middleware
- 📚 Swagger API documentation
- 🎯 Role-based route protection

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT + Passport.js
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # Route definitions
├── middlewares/     # Custom middleware
├── utils/           # Utility functions
├── config/          # Configuration
└── index.js         # Application entry point

models/              # Sequelize models
├── user.js          # User model
├── student.js       # Student model
├── teacher.js       # Teacher model
├── parent.js        # Parent model
├── staff.js         # Staff model
├── gradelevel.js    # Grade level model
├── subject.js       # Subject model
└── class.js         # Class model

migrations/          # Database migrations
seeders/             # Database seeders
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your MySQL database and update `config/config.json` with your database credentials:
   ```json
   {
     "development": {
       "username": "your_username",
       "password": "your_password",
       "database": "highschool",
       "host": "127.0.0.1",
       "dialect": "mysql"
     }
   }
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Seed the database with initial data:
   ```bash
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:seed:undo` - Undo database seeding

## API Documentation

The API documentation is available at `http://localhost:3000/api-docs` when the server is running.

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access Control

The system supports the following user roles:

- **ADMIN**: Full system access
- **STAFF**: User management, announcements, support
- **TEACHER**: Material management, grade assignment, class management
- **STUDENT**: View materials, submit work, view grades
- **PARENT**: View child's grades and attendance

### API Endpoints

#### Public Endpoints
- `GET /api/users/public` - Public user information

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

#### User Management (Admin/Staff)
- `GET /api/users` - List all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin/Staff)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/me` - Get current user profile

#### Student Management
- `GET /api/students` - List all students (Admin/Teacher/Staff)
- `GET /api/students/:id` - Get student by ID (Admin/Teacher/Staff)
- `POST /api/students` - Create student (Admin only)
- `PUT /api/students/:id` - Update student (Admin/Teacher)
- `DELETE /api/students/:id` - Delete student (Admin only)

#### Teacher Management
- `GET /api/teachers` - List all teachers (Admin only)
- `GET /api/teachers/:id` - Get teacher by ID (Admin/Teacher)
- `POST /api/teachers` - Create teacher (Admin only)
- `PUT /api/teachers/:id` - Update teacher (Admin only)
- `DELETE /api/teachers/:id` - Delete teacher (Admin only)
- `POST /api/teachers/:id/assign` - Assign subjects and classes (Admin only)
- `GET /api/teachers/:id/classes` - List assigned classes (Admin/Teacher)

#### Parent Management
- `POST /api/parents/link` - Link parent to student (Admin only)
- `GET /api/parents/:id/grades` - View child grades (Admin/Parent)
- `GET /api/parents/:id/attendance` - View child attendance (Admin/Parent)

#### Class Management
- `GET /api/classes` - List all classes (Admin/Staff)
- `GET /api/classes/:id` - Get class by ID (Admin/Staff/Teacher)
- `POST /api/classes` - Create class (Admin only)
- `PUT /api/classes/:id` - Update class (Admin only)
- `DELETE /api/classes/:id` - Delete class (Admin only)
- `POST /api/classes/:id/assign-teacher` - Assign teacher to class (Admin/Teacher)
- `POST /api/classes/:id/assign-students` - Assign students to class (Admin/Teacher)
- `GET /api/classes/:id/schedule` - Get class schedule (Admin/Staff/Teacher)

#### Grade Management
- `POST /api/grades` - Assign grade (Admin/Teacher)
- `GET /api/grades/class/:classId` - Fetch grades by class (Admin/Teacher)
- `GET /api/grades/student/:studentId` - Fetch grades by student (Admin/Teacher/Parent)
- `GET /api/grades/subject/:subjectId` - Fetch grades by subject (Admin/Teacher)
- `PUT /api/grades/:id` - Update grade (Admin/Teacher)

#### Subject Management
- `GET /api/subjects` - List all subjects (Admin/Teacher/Staff)
- `GET /api/subjects/:id` - Get subject by ID (Admin/Teacher/Staff)
- `POST /api/subjects` - Create subject (Admin only)
- `PUT /api/subjects/:id` - Update subject (Admin only)
- `DELETE /api/subjects/:id` - Delete subject (Admin only)
- `POST /api/subjects/:id/assign-grade-level` - Assign subject to grade level (Admin only)

#### Material Management
- `GET /api/materials` - List materials (Teacher/Student)
- `GET /api/materials/:id` - View material (Teacher/Student)
- `POST /api/materials` - Create material (Teacher only)
- `PUT /api/materials/:id` - Update material (Teacher only)
- `DELETE /api/materials/:id` - Delete material (Teacher only)

## Database Schema

### Core Models

- **User**: Central user management (firstName, lastName, email, password, role, phoneNumber)
- **Student**: Student information linked to User, GradeLevel, and Class
- **Teacher**: Teacher information linked to User
- **Parent**: Parent information linked to User
- **Staff**: Staff information linked to User

### Academic Models

- **GradeLevel**: Grade levels (e.g., Grade 9, Grade 10)
- **Subject**: Academic subjects linked to GradeLevel
- **Class**: Class instances linked to Subject and Teacher

### Relationships

- User has one-to-one relationships with Student, Teacher, Parent, Staff
- Student belongs to GradeLevel and Class
- Student has many-to-many relationship with Parent through ParentStudent
- Teacher has many Classes
- Subject belongs to GradeLevel and has many Classes
- Class belongs to Subject and Teacher, has many Students

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret
```

## Initial Test Data

The seeder creates the following test users:

- **admin@example.com** (STAFF role) - Password: admin123
- **teacher1@example.com** (TEACHER role) - Password: teacher123
- **parent1@example.com** (PARENT role) - Password: parent123
- **student1@example.com** (STUDENT role) - Password: student123

Plus:
- Grade 9 with Mathematics and English subjects
- One class (Block A, Room 101)
- Parent-student relationship

## Development

The project uses:

- **JavaScript** with modern ES6+ features
- **ESLint** for code linting
- **Prettier** for code formatting
- **Express Router** for route management
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Sequelize** for database operations
- **JWT** for authentication
- **Passport.js** for authentication strategies

## Role-Based Access Control

The system implements role-based access control using middleware:

```javascript
// Example: Protect route for teachers only
router.post('/materials', authenticate, authorize(['TEACHER']), createMaterial);

// Example: Allow multiple roles
router.get('/grades', authenticate, authorize(['ADMIN', 'TEACHER', 'PARENT']), getGrades);
```

## License

MIT 