module.exports = (sequelize, DataTypes) => {
  const UserLevel = sequelize.define("UserLevel", {
    id: {
      type: DataTypes.INTEGER(8),
      primaryKey: true,
      autoIncrement: true,
    },
    points: {
      type: DataTypes.INTEGER(8),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  });

  return UserLevel;
};
