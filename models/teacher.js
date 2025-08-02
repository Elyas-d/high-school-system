'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Teacher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs to User
      Teacher.belongsTo(models.User, { foreignKey: 'userId' });
      
      // Has many Classes
      Teacher.hasMany(models.Class, { foreignKey: 'teacherId' });
    }
  }
  Teacher.init({
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Teacher',
  });
  return Teacher;
};