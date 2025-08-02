'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Parent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs to User
      Parent.belongsTo(models.User, { foreignKey: 'userId' });
      
      // Many-to-many with Student (through ParentStudent join table)
      Parent.belongsToMany(models.Student, { 
        through: 'ParentStudent',
        foreignKey: 'parentId',
        otherKey: 'studentId'
      });
    }
  }
  Parent.init({
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Parent',
  });
  return Parent;
};