'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Class extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs to Subject
      Class.belongsTo(models.Subject, { foreignKey: 'subjectId' });
      
      // Belongs to Teacher
      Class.belongsTo(models.Teacher, { foreignKey: 'teacherId' });
      
      // Has many Students
      Class.hasMany(models.Student, { foreignKey: 'classId' });
    }
  }
  Class.init({
    subjectId: DataTypes.INTEGER,
    teacherId: DataTypes.INTEGER,
    schedule: DataTypes.STRING,
    roomNumber: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Class',
  });
  return Class;
}; 