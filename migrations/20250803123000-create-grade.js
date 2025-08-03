'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Grades', {
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
      subjectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Subjects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      classId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      gradeValue: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false
      },
      gradeType: {
        type: Sequelize.ENUM('EXAM', 'QUIZ', 'ASSIGNMENT', 'PROJECT', 'PARTICIPATION'),
        allowNull: false,
        defaultValue: 'ASSIGNMENT'
      },
      maxPoints: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false,
        defaultValue: 100
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      gradedAt: {
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

    // Add indexes for better query performance
    await queryInterface.addIndex('Grades', ['studentId']);
    await queryInterface.addIndex('Grades', ['subjectId']);
    await queryInterface.addIndex('Grades', ['classId']);
    await queryInterface.addIndex('Grades', ['gradedAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Grades');
  }
};
