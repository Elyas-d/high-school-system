'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords for different roles
    const passwordHashes = {
      admin: await bcrypt.hash('admin123', 10),
      teacher: await bcrypt.hash('teacher123', 10),
      parent: await bcrypt.hash('parent123', 10),
      student: await bcrypt.hash('student123', 10),
    };

    // 1. Create Users (Admin, Teachers, Parents, Students)
    await queryInterface.bulkInsert('Users', [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'admin@highschool.edu',
        password: passwordHashes.admin,
        role: 'ADMIN',
        phoneNumber: '555-0001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Michael',
        lastName: 'Davis',
        email: 'principal@highschool.edu',
        password: passwordHashes.admin,
        role: 'STAFF',
        phoneNumber: '555-0002',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Dr. Emily',
        lastName: 'Rodriguez',
        email: 'e.rodriguez@highschool.edu',
        password: passwordHashes.teacher,
        role: 'TEACHER',
        phoneNumber: '555-0101',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'James',
        lastName: 'Wilson',
        email: 'j.wilson@highschool.edu',
        password: passwordHashes.teacher,
        role: 'TEACHER',
        phoneNumber: '555-0102',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Lisa',
        lastName: 'Thompson',
        email: 'l.thompson@highschool.edu',
        password: passwordHashes.teacher,
        role: 'TEACHER',
        phoneNumber: '555-0103',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Robert',
        lastName: 'Martinez',
        email: 'r.martinez@highschool.edu',
        password: passwordHashes.teacher,
        role: 'TEACHER',
        phoneNumber: '555-0104',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Jennifer',
        lastName: 'Brown',
        email: 'j.brown@highschool.edu',
        password: passwordHashes.teacher,
        role: 'TEACHER',
        phoneNumber: '555-0105',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'David',
        lastName: 'Anderson',
        email: 'd.anderson@email.com',
        password: passwordHashes.parent,
        role: 'PARENT',
        phoneNumber: '555-0201',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'm.garcia@email.com',
        password: passwordHashes.parent,
        role: 'PARENT',
        phoneNumber: '555-0202',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'j.smith@email.com',
        password: passwordHashes.parent,
        role: 'PARENT',
        phoneNumber: '555-0203',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Susan',
        lastName: 'Lee',
        email: 's.lee@email.com',
        password: passwordHashes.parent,
        role: 'PARENT',
        phoneNumber: '555-0204',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Alex',
        lastName: 'Anderson',
        email: 'alex.anderson@student.edu',
        password: passwordHashes.student,
        role: 'STUDENT',
        phoneNumber: '555-0301',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Sofia',
        lastName: 'Garcia',
        email: 'sofia.garcia@student.edu',
        password: passwordHashes.student,
        role: 'STUDENT',
        phoneNumber: '555-0302',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Emma',
        lastName: 'Smith',
        email: 'emma.smith@student.edu',
        password: passwordHashes.student,
        role: 'STUDENT',
        phoneNumber: '555-0303',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Liam',
        lastName: 'Johnson',
        email: 'liam.johnson@student.edu',
        password: passwordHashes.student,
        role: 'STUDENT',
        phoneNumber: '555-0304',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Olivia',
        lastName: 'Williams',
        email: 'olivia.williams@student.edu',
        password: passwordHashes.student,
        role: 'STUDENT',
        phoneNumber: '555-0305',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Noah',
        lastName: 'Brown',
        email: 'noah.brown@student.edu',
        password: passwordHashes.student,
        role: 'STUDENT',
        phoneNumber: '555-0306',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Ava',
        lastName: 'Davis',
        email: 'ava.davis@student.edu',
        password: passwordHashes.student,
        role: 'STUDENT',
        phoneNumber: '555-0307',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'William',
        lastName: 'Miller',
        email: 'william.miller@student.edu',
        password: passwordHashes.student,
        role: 'STUDENT',
        phoneNumber: '555-0308',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Get all created users
    const users = await queryInterface.sequelize.query(
      'SELECT id, email, role FROM Users ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Separate users by role
    const adminUsers = users.filter(u => u.role === 'ADMIN' || u.role === 'STAFF');
    const teacherUsers = users.filter(u => u.role === 'TEACHER');
    const parentUsers = users.filter(u => u.role === 'PARENT');
    const studentUsers = users.filter(u => u.role === 'STUDENT');

    // 2. Create Grade Levels
    await queryInterface.bulkInsert('GradeLevels', [
      {
        name: 'Grade 9',
        description: 'Freshman Year - Introduction to high school curriculum',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Grade 10',
        description: 'Sophomore Year - Building foundational knowledge',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Grade 11',
        description: 'Junior Year - Advanced coursework and college preparation',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Grade 12',
        description: 'Senior Year - College readiness and specialization',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    const gradeLevels = await queryInterface.sequelize.query(
      'SELECT id, name FROM GradeLevels ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 3. Create Subjects
    await queryInterface.bulkInsert('Subjects', [
      {
        name: 'Mathematics',
        description: 'Comprehensive mathematics including algebra, geometry, and calculus',
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 10').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'English Literature',
        description: 'Reading, writing, and analysis of literary works',
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 10').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Biology',
        description: 'Study of living organisms and life processes',
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 11').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chemistry',
        description: 'Study of matter, its properties, and reactions',
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 11').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Physics',
        description: 'Study of matter, energy, and their interactions',
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 12').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'World History',
        description: 'Comprehensive study of world civilizations and events',
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 10').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Physical Education',
        description: 'Physical fitness, sports, and health education',
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 9').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Art',
        description: 'Visual arts, drawing, painting, and creative expression',
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 9').id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    const subjects = await queryInterface.sequelize.query(
      'SELECT id, name FROM Subjects ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 4. Create Staff records
    const staffData = adminUsers.map(user => ({
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    await queryInterface.bulkInsert('Staffs', staffData);

    // 5. Create Teacher records
    const teacherData = teacherUsers.map(user => ({
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    await queryInterface.bulkInsert('Teachers', teacherData);

    const teachers = await queryInterface.sequelize.query(
      'SELECT id, userId FROM Teachers ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 6. Create Parent records
    const parentData = parentUsers.map(user => ({
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    await queryInterface.bulkInsert('Parents', parentData);

    const parents = await queryInterface.sequelize.query(
      'SELECT id, userId FROM Parents ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 7. Create Classes
    const classData = [
      {
        subjectId: subjects.find(s => s.name === 'Mathematics').id,
        teacherId: teachers[0].id,
        schedule: 'Mon-Wed-Fri 8:00-9:00 AM',
        roomNumber: 'M101',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subjectId: subjects.find(s => s.name === 'Mathematics').id,
        teacherId: teachers[0].id,
        schedule: 'Tue-Thu 10:00-11:30 AM',
        roomNumber: 'M102',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subjectId: subjects.find(s => s.name === 'English Literature').id,
        teacherId: teachers[1].id,
        schedule: 'Mon-Wed-Fri 9:00-10:00 AM',
        roomNumber: 'E201',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subjectId: subjects.find(s => s.name === 'English Literature').id,
        teacherId: teachers[1].id,
        schedule: 'Tue-Thu 1:00-2:30 PM',
        roomNumber: 'E202',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subjectId: subjects.find(s => s.name === 'Biology').id,
        teacherId: teachers[2].id,
        schedule: 'Mon-Wed-Fri 10:00-11:00 AM',
        roomNumber: 'S301',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subjectId: subjects.find(s => s.name === 'Chemistry').id,
        teacherId: teachers[3].id,
        schedule: 'Tue-Thu 8:00-9:30 AM',
        roomNumber: 'S302',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subjectId: subjects.find(s => s.name === 'Physics').id,
        teacherId: teachers[3].id,
        schedule: 'Mon-Wed-Fri 2:00-3:00 PM',
        roomNumber: 'S303',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subjectId: subjects.find(s => s.name === 'World History').id,
        teacherId: teachers[4].id,
        schedule: 'Tue-Thu 11:00-12:30 PM',
        roomNumber: 'H401',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subjectId: subjects.find(s => s.name === 'Physical Education').id,
        teacherId: teachers[4].id,
        schedule: 'Mon-Wed-Fri 3:00-4:00 PM',
        roomNumber: 'GYM1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subjectId: subjects.find(s => s.name === 'Art').id,
        teacherId: teachers[2].id,
        schedule: 'Tue-Thu 2:30-4:00 PM',
        roomNumber: 'ART1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await queryInterface.bulkInsert('Classes', classData);

    const classes = await queryInterface.sequelize.query(
      'SELECT id, subjectId, roomNumber FROM Classes ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 8. Create Student records
    const studentData = [
      {
        userId: studentUsers[0].id,
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 10').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: studentUsers[1].id,
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 10').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: studentUsers[2].id,
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 11').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: studentUsers[3].id,
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 11').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: studentUsers[4].id,
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 12').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: studentUsers[5].id,
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 12').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: studentUsers[6].id,
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 9').id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: studentUsers[7].id,
        gradeLevelId: gradeLevels.find(g => g.name === 'Grade 9').id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await queryInterface.bulkInsert('Students', studentData);

    const students = await queryInterface.sequelize.query(
      'SELECT id, userId FROM Students ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 9. Create Parent-Student relationships
    const parentStudentData = [
      { parentId: parents[0].id, studentId: students[0].id, createdAt: new Date(), updatedAt: new Date() },
      { parentId: parents[1].id, studentId: students[1].id, createdAt: new Date(), updatedAt: new Date() },
      { parentId: parents[2].id, studentId: students[2].id, createdAt: new Date(), updatedAt: new Date() },
      { parentId: parents[3].id, studentId: students[3].id, createdAt: new Date(), updatedAt: new Date() },
      { parentId: parents[0].id, studentId: students[4].id, createdAt: new Date(), updatedAt: new Date() },
      { parentId: parents[1].id, studentId: students[5].id, createdAt: new Date(), updatedAt: new Date() }
    ];
    await queryInterface.bulkInsert('ParentStudents', parentStudentData);

    const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    // 10. Create Enrollments to link Students to Classes
    const enrollmentData = [
      { studentId: students[0].id, classId: classes[0].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[0].id, classId: classes[2].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[1].id, classId: classes[1].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[1].id, classId: classes[3].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[2].id, classId: classes[4].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[2].id, classId: classes[5].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[3].id, classId: classes[4].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[3].id, classId: classes[5].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[4].id, classId: classes[6].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[5].id, classId: classes[7].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[6].id, classId: classes[8].id, academicYear, createdAt: new Date(), updatedAt: new Date() },
      { studentId: students[7].id, classId: classes[9].id, academicYear, createdAt: new Date(), updatedAt: new Date() }
    ];
    await queryInterface.bulkInsert('Enrollments', enrollmentData);

    console.log('✅ Comprehensive seed data created successfully!');
    console.log(`📊 Created: ${users.length} users, ${gradeLevels.length} grade levels, ${subjects.length} subjects, ${classes.length} classes, ${students.length} students`);
  },

  async down(queryInterface, Sequelize) {
    // Remove data in reverse order to respect foreign key constraints
    await queryInterface.bulkDelete('Enrollments', null, {});
    await queryInterface.bulkDelete('ParentStudents', null, {});
    await queryInterface.bulkDelete('Students', null, {});
    await queryInterface.bulkDelete('Classes', null, {});
    await queryInterface.bulkDelete('Parents', null, {});
    await queryInterface.bulkDelete('Teachers', null, {});
    await queryInterface.bulkDelete('Staffs', null, {});
    await queryInterface.bulkDelete('Subjects', null, {});
    await queryInterface.bulkDelete('GradeLevels', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    
    console.log('🗑️ All seed data removed successfully!');
  }
};
