'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Get the current year for the academicYear field
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    // Get existing students and classes to create realistic enrollments
    const students = await queryInterface.sequelize.query(
      'SELECT id FROM Students ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const classes = await queryInterface.sequelize.query(
      'SELECT id FROM Classes ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create comprehensive enrollment data
    const enrollmentData = [];
    
    // Each student should be enrolled in 4-6 classes (realistic high school schedule)
    students.forEach((student, index) => {
      // Determine how many classes this student should take (4-6 classes)
      const numClasses = 4 + (index % 3); // Will give 4, 5, or 6 classes per student
      
      // Select random classes for this student (without duplicates)
      const selectedClasses = [];
      for (let i = 0; i < numClasses && selectedClasses.length < classes.length; i++) {
        let classIndex = (index * 2 + i) % classes.length;
        if (!selectedClasses.includes(classIndex)) {
          selectedClasses.push(classIndex);
          
          enrollmentData.push({
            studentId: student.id,
            classId: classes[classIndex].id,
            academicYear: academicYear,
            finalGrade: null, // Will be set later in the academic year
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    });

    await queryInterface.bulkInsert('Enrollments', enrollmentData, {});
    
    console.log(`✅ Created ${enrollmentData.length} enrollment records for ${students.length} students across ${classes.length} classes`);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Enrollments', null, {});
  }
};
