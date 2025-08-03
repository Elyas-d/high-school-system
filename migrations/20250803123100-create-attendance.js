'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Attendances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      studentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Students',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      classId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subjectId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Subjects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED'),
        allowNull: false,
        defaultValue: 'PRESENT'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      recordedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint to prevent duplicate attendance records for same student, class, and date
    await queryInterface.addConstraint('Attendances', {
      fields: ['studentId', 'classId', 'date'],
      type: 'unique',
      name: 'student_class_date_unique'
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('Attendances', ['studentId']);
    await queryInterface.addIndex('Attendances', ['classId']);
    await queryInterface.addIndex('Attendances', ['date']);
    await queryInterface.addIndex('Attendances', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Attendances');
  }
};
