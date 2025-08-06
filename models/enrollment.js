'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    static associate(models) {
      // No direct associations needed here as it's a through table
    }
  }
  Enrollment.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    studentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Students',
        key: 'id'
      }
    },
    classId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    academicYear: {
      type: DataTypes.STRING, // e.g., "2023-2024"
      allowNull: false
    },
    finalGrade: {
      type: DataTypes.STRING, // e.g., "A", "B+", or a numeric grade
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Enrollment',
  });
  return Enrollment;
};
