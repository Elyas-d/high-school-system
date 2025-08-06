'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash('password123', 10);
    const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    // 1. Users
    const users = await queryInterface.bulkInsert('Users', [
      { firstName: 'Admin', lastName: 'User', email: 'admin@example.com', password, role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
      { firstName: 'Staff', lastName: 'User', email: 'staff@example.com', password, role: 'STAFF', createdAt: new Date(), updatedAt: new Date() },
      { firstName: 'Emily', lastName: 'Teacher', email: 'teacher.emily@example.com', password, role: 'TEACHER', createdAt: new Date(), updatedAt: new Date() },
      { firstName: 'James', lastName: 'Teacher', email: 'teacher.james@example.com', password, role: 'TEACHER', createdAt: new Date(), updatedAt: new Date() },
      { firstName: 'David', lastName: 'Parent', email: 'parent.david@example.com', password, role: 'PARENT', createdAt: new Date(), updatedAt: new Date() },
      { firstName: 'Maria', lastName: 'Parent', email: 'parent.maria@example.com', password, role: 'PARENT', createdAt: new Date(), updatedAt: new Date() },
      { firstName: 'Alex', lastName: 'Student', email: 'student.alex@example.com', password, role: 'STUDENT', createdAt: new Date(), updatedAt: new Date() },
      { firstName: 'Sofia', lastName: 'Student', email: 'student.sofia@example.com', password, role: 'STUDENT', createdAt: new Date(), updatedAt: new Date() },
    ], { returning: ['id', 'role'] });

    // 2. Grade Levels
    const gradeLevels = await queryInterface.bulkInsert('GradeLevels', [
      { name: 'Grade 9', description: 'Freshman Year', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Grade 10', description: 'Sophomore Year', createdAt: new Date(), updatedAt: new Date() },
    ], { returning: true });

    // 3. Role-specific tables (Staff, Teacher, Parent)
    const staff = await queryInterface.bulkInsert('Staffs', [{ userId: users.find(u => u.role === 'STAFF').id, createdAt: new Date(), updatedAt: new Date() }], { returning: true });
    const teachers = await queryInterface.bulkInsert('Teachers', users.filter(u => u.role === 'TEACHER').map(u => ({ userId: u.id, createdAt: new Date(), updatedAt: new Date() })), { returning: true });
    const parents = await queryInterface.bulkInsert('Parents', users.filter(u => u.role === 'PARENT').map(u => ({ userId: u.id, createdAt: new Date(), updatedAt: new Date() })), { returning: true });

    // 4. Subjects
    const subjects = await queryInterface.bulkInsert('Subjects', [
      { name: 'Algebra I', description: 'Fundamental mathematics', gradeLevelId: gradeLevels[0].id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'English 9', description: 'Literature and composition', gradeLevelId: gradeLevels[0].id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Geometry', description: 'Advanced mathematics', gradeLevelId: gradeLevels[1].id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'World History', description: 'Historical studies', gradeLevelId: gradeLevels[1].id, createdAt: new Date(), updatedAt: new Date() },
    ], { returning: true });

    // 5. Classes
    const classes = await queryInterface.bulkInsert('Classes', [
      { subjectId: subjects[0].id, teacherId: teachers[0].id, schedule: 'Mon/Wed/Fri 9:00 AM', roomNumber: '101', createdAt: new Date(), updatedAt: new Date() },
      { subjectId: subjects[1].id, teacherId: teachers[1].id, schedule: 'Mon/Wed/Fri 10:00 AM', roomNumber: '102', createdAt: new Date(), updatedAt: new Date() },
      { subjectId: subjects[2].id, teacherId: teachers[0].id, schedule: 'Tue/Thu 9:00 AM', roomNumber: '201', createdAt: new Date(), updatedAt: new Date() },
      { subjectId: subjects[3].id, teacherId: teachers[1].id, schedule: 'Tue/Thu 10:30 AM', roomNumber: '202', createdAt: new Date(), updatedAt: new Date() },
    ], { returning: true });

    // 6. Students
    const students = await queryInterface.bulkInsert('Students', [
      { userId: users.find(u => u.email === 'student.alex@example.com').id, gradeLevelId: gradeLevels[0].id, createdAt: new Date(), updatedAt: new Date() },
      { userId: users.find(u => u.email === 'student.sofia@example.com').id, gradeLevelId: gradeLevels[1].id, createdAt: new Date(), updatedAt: new Date() },
    ], { returning: true });

    // 7. Parent-Student relationships
    await queryInterface.bulkInsert('ParentStudents', [
      { parentId: parents[0].id, studentId: students[0].id, createdAt: new Date(), updatedAt: new Date() },
      { parentId: parents[1].id, studentId: students[1].id, createdAt: new Date(), updatedAt: new Date() },
    ]);

    // 8. Enrollments (The crucial step)
    await queryInterface.bulkInsert('Enrollments', [
      // Alex (Grade 9) is enrolled in Algebra I and English 9
      { studentId: students[0].id, classId: classes[0].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[0].id, classId: classes[1].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      // Sofia (Grade 10) is enrolled in Geometry and World History
      { studentId: students[1].id, classId: classes[2].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[1].id, classId: classes[3].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
    ]);

    console.log('✅ Database seeded successfully!');
  },

  async down(queryInterface, Sequelize) {
    // Truncate tables in reverse order of creation to handle foreign key constraints
    await queryInterface.bulkDelete('Enrollments', null, {});
    await queryInterface.bulkDelete('ParentStudents', null, {});
    await queryInterface.bulkDelete('Students', null, {});
    await queryInterface.bulkDelete('Classes', null, {});
    await queryInterface.bulkDelete('Subjects', null, {});
    await queryInterface.bulkDelete('Parents', null, {});
    await queryInterface.bulkDelete('Teachers', null, {});
    await queryInterface.bulkDelete('Staffs', null, {});
    await queryInterface.bulkDelete('GradeLevels', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    console.log('🗑️ All seed data removed.');
  }
};
