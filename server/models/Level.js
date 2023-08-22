module.exports = (sequelize, DataTypes) => {
  const Level = sequelize.define("Level", {
    id: {
      type: DataTypes.INTEGER(2),
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    minPoints: {
      type: DataTypes.INTEGER(8),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    maxPoints: {
      type: DataTypes.INTEGER(8),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });
  Level.associate = (models) => {
    Level.belongsToMany(models.User, {
      through: models.UserLevel,
      onDelete: "CASCADE",
    });
  };
  return Level;
};
