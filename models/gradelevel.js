'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GradeLevel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Has many Students
      GradeLevel.hasMany(models.Student, { foreignKey: 'gradeLevelId' });
      
      // Has many Subjects
      GradeLevel.hasMany(models.Subject, { foreignKey: 'gradeLevelId' });
    }
  }
  GradeLevel.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'GradeLevel',
  });
  return GradeLevel;
};