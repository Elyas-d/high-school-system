'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Students', 'classId');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Students', 'classId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Or false, depending on your old schema
      references: {
        model: 'Classes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};
