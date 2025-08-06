'use strict';
// This file likely seeds your initial student.
// The user IDs and gradeLevelIds depend on your other seeders.

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Students', [
      {
        userId: 4, // Assuming the 4th user is student1@example.com
        gradeLevelId: 1, // Assuming Grade 9 has id 1
        // classId: 1, <-- REMOVE THIS LINE
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Students', null, {});
  }
};
