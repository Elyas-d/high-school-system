'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Staff extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs to User
      Staff.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Staff.init({
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Staff',
  });
  return Staff;
};