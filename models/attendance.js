'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs to associations
      Attendance.belongsTo(models.Student, { foreignKey: 'studentId', as: 'Student' });
      Attendance.belongsTo(models.Class, { foreignKey: 'classId', as: 'Class' });
      Attendance.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'Subject' });
    }
  }
  Attendance.init({
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED'),
      allowNull: false,
      defaultValue: 'PRESENT'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    recordedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Attendance',
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'classId', 'date']
      }
    ]
  });
  return Attendance;
};
