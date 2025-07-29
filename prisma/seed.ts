import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed GradeLevel
  let gradeLevel = await prisma.gradeLevel.findFirst({ where: { name: 'Grade 10' } });
  if (!gradeLevel) {
    gradeLevel = await prisma.gradeLevel.create({
      data: {
        name: 'Grade 10',
        description: 'Tenth grade',
      },
    });
    console.log('Created GradeLevel:', gradeLevel.name);
  } else {
    console.log('Found existing GradeLevel:', gradeLevel.name);
  }

  // 2. Seed Subject
  let subject = await prisma.subject.findFirst({ where: { name: 'Mathematics', gradeLevelId: gradeLevel.id } });
  if (!subject) {
    subject = await prisma.subject.create({
      data: {
        name: 'Mathematics',
        description: 'Math subject',
        gradeLevelId: gradeLevel.id,
      },
    });
    console.log('Created Subject:', subject.name);
  } else {
    console.log('Found existing Subject:', subject.name);
  }

  // 3. Seed Users (one per role)
  const passwordHashes = {
    admin: await bcrypt.hash('admin123', 10),
    teacher: await bcrypt.hash('teacher123', 10),
    student: await bcrypt.hash('student123', 10),
    parent: await bcrypt.hash('parent123', 10),
    staff: await bcrypt.hash('staff123', 10),
  };

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@school.com',
      password: passwordHashes.admin,
      role: UserRole.ADMIN,
      phoneNumber: '1000000000',
    },
  });
  console.log('Seeded Admin User:', adminUser.email);

  // Teacher
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@school.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'teacher@school.com',
      password: passwordHashes.teacher,
      role: UserRole.TEACHER,
      phoneNumber: '2000000000',
    },
  });
  console.log('Seeded Teacher User:', teacherUser.email);

  // Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@school.com' },
    update: {},
    create: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'student@school.com',
      password: passwordHashes.student,
      role: UserRole.STUDENT,
      phoneNumber: '3000000000',
    },
  });
  console.log('Seeded Student User:', studentUser.email);

  // Parent
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@school.com' },
    update: {},
    create: {
      firstName: 'Mary',
      lastName: 'Smith',
      email: 'parent@school.com',
      password: passwordHashes.parent,
      role: UserRole.PARENT,
      phoneNumber: '4000000000',
    },
  });
  console.log('Seeded Parent User:', parentUser.email);

  // Staff
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@school.com' },
    update: {},
    create: {
      firstName: 'Staff',
      lastName: 'Member',
      email: 'staff@school.com',
      password: passwordHashes.staff,
      role: UserRole.STAFF,
      phoneNumber: '5000000000',
    },
  });
  console.log('Seeded Staff User:', staffUser.email);

  // 4. Create Teacher, Student, Parent, and relational data
  // Teacher
  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
    },
  });

  // Class (linked to teacher and subject)
  const classObj = await prisma.class.upsert({
    where: { id: 'seed-class-1' },
    update: {},
    create: {
      id: 'seed-class-1', // deterministic for upsert
      subjectId: subject.id,
      teacherId: teacher.id,
      schedule: 'Mon-Fri 8:00-9:00',
      roomNumber: '101',
    },
  });
  console.log('Seeded Class:', classObj.id);

  // Student
  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      gradeLevelId: gradeLevel.id,
      classId: classObj.id,
    },
  });

  // Parent
  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
    },
  });

  // Link Parent to Student (ParentStudent join table)
  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId: parent.id, studentId: student.id } },
    update: {},
    create: {
      parentId: parent.id,
      studentId: student.id,
    },
  });
  console.log('Linked Parent to Student');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 