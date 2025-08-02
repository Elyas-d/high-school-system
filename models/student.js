'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs to associations
      Student.belongsTo(models.User, { foreignKey: 'userId' });
      Student.belongsTo(models.GradeLevel, { foreignKey: 'gradeLevelId' });
      Student.belongsTo(models.Class, { foreignKey: 'classId' });
      
      // Many-to-many with Parent (through ParentStudent join table)
      Student.belongsToMany(models.Parent, { 
        through: 'ParentStudent',
        foreignKey: 'studentId',
        otherKey: 'parentId'
      });
    }
  }
  Student.init({
    userId: DataTypes.INTEGER,
    gradeLevelId: DataTypes.INTEGER,
    classId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Student',
  });
  return Student;
};