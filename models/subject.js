'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs to GradeLevel
      Subject.belongsTo(models.GradeLevel, { foreignKey: 'gradeLevelId' });
      
      // Has many Classes
      Subject.hasMany(models.Class, { foreignKey: 'subjectId' });
    }
  }
  Subject.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    gradeLevelId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Subject',
  });
  return Subject;
};