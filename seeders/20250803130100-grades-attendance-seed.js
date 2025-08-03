'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get existing data to create relationships
    const students = await queryInterface.sequelize.query(
      'SELECT id FROM Students ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const subjects = await queryInterface.sequelize.query(
      'SELECT id, name FROM Subjects ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const classes = await queryInterface.sequelize.query(
      'SELECT id, subjectId FROM Classes ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (students.length === 0 || subjects.length === 0 || classes.length === 0) {
      console.log('⚠️ Please run the comprehensive seed first to create users, students, subjects, and classes');
      return;
    }

    // Helper function to generate random grade
    const randomGrade = (min = 60, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Helper function to generate random date within last 3 months
    const randomDate = () => {
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      return new Date(threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime()));
    };

    // Grade types for variety
    const gradeTypes = ['EXAM', 'QUIZ', 'ASSIGNMENT', 'PROJECT', 'PARTICIPATION'];

    // 1. Create Grades for each student in multiple subjects
    const gradeData = [];
    
    students.forEach(student => {
      // Each student gets grades in 4-6 different subjects
      const numSubjects = Math.floor(Math.random() * 3) + 4; // 4-6 subjects
      const selectedSubjects = subjects.slice(0, numSubjects);
      
      selectedSubjects.forEach(subject => {
        // Each subject gets 3-8 grades per student
        const numGrades = Math.floor(Math.random() * 6) + 3; // 3-8 grades
        
        for (let i = 0; i < numGrades; i++) {
          const gradeType = gradeTypes[Math.floor(Math.random() * gradeTypes.length)];
          const maxPoints = gradeType === 'PARTICIPATION' ? 10 : 
                           gradeType === 'QUIZ' ? 20 : 
                           gradeType === 'ASSIGNMENT' ? 50 : 100;
          
          gradeData.push({
            studentId: student.id,
            subjectId: subject.id,
            classId: classes.find(c => c.subjectId === subject.id)?.id || classes[0].id,
            gradeValue: randomGrade(maxPoints * 0.6, maxPoints), // 60% to 100% of max points
            gradeType: gradeType,
            maxPoints: maxPoints,
            description: `${gradeType.toLowerCase()} - ${subject.name}`,
            gradedAt: randomDate(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
    });

    await queryInterface.bulkInsert('Grades', gradeData);

    // 2. Create Attendance records
    const attendanceData = [];
    const attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
    
    students.forEach(student => {
      // Generate attendance for last 60 days for each student
      const daysToGenerate = 60;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysToGenerate);
      
      // Each student has attendance in 3-5 subjects
      const numSubjects = Math.floor(Math.random() * 3) + 3; // 3-5 subjects
      const selectedSubjects = subjects.slice(0, numSubjects);
      
      selectedSubjects.forEach(subject => {
        // Generate attendance for each day (only weekdays)
        for (let day = 0; day < daysToGenerate; day++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + day);
          
          // Skip weekends
          if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            continue;
          }
          
          // 85% chance of being present, 10% absent, 3% late, 2% excused
          const rand = Math.random();
          let status;
          if (rand < 0.85) status = 'PRESENT';
          else if (rand < 0.95) status = 'ABSENT';
          else if (rand < 0.98) status = 'LATE';
          else status = 'EXCUSED';
          
          attendanceData.push({
            studentId: student.id,
            classId: classes.find(c => c.subjectId === subject.id)?.id || classes[0].id,
            subjectId: subject.id,
            date: currentDate,
            status: status,
            notes: status === 'ABSENT' ? 'Unexcused absence' : 
                   status === 'LATE' ? 'Arrived 10 minutes late' :
                   status === 'EXCUSED' ? 'Medical appointment' : null,
            recordedAt: currentDate,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
    });

    await queryInterface.bulkInsert('Attendances', attendanceData);

    console.log('✅ Grades and attendance data created successfully!');
    console.log(`📊 Created: ${gradeData.length} grades, ${attendanceData.length} attendance records`);
  },

  async down(queryInterface, Sequelize) {
    // Remove data in reverse order
    await queryInterface.bulkDelete('Attendances', null, {});
    await queryInterface.bulkDelete('Grades', null, {});
    
    console.log('🗑️ Grades and attendance data removed successfully!');
  }
};
