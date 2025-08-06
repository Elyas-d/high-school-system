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
      
      // Many-to-many with Parent (through ParentStudents join table)
      Student.belongsToMany(models.Parent, { 
        through: 'ParentStudents',
        foreignKey: 'studentId',
        otherKey: 'parentId',
        as: 'Parents'
      });

      // Many-to-many with Class (through Enrollment join table)
      Student.belongsToMany(models.Class, {
        through: models.Enrollment,
        foreignKey: 'studentId',
        otherKey: 'classId',
        as: 'Classes' // Add alias to match controller queries
      });
    }
  }
  Student.init({
    userId: DataTypes.INTEGER,
    gradeLevelId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Student',
  });
  return Student;
};