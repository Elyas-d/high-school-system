'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Grade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs to associations
      Grade.belongsTo(models.Student, { foreignKey: 'studentId', as: 'Student' });
      Grade.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'Subject' });
      Grade.belongsTo(models.Class, { foreignKey: 'classId', as: 'Class' });
    }
  }
  Grade.init({
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gradeValue: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    gradeType: {
      type: DataTypes.ENUM('EXAM', 'QUIZ', 'ASSIGNMENT', 'PROJECT', 'PARTICIPATION'),
      allowNull: false,
      defaultValue: 'ASSIGNMENT'
    },
    maxPoints: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      defaultValue: 100
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    gradedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Grade',
  });
  return Grade;
};
