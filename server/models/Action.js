module.exports = (sequelize, DataTypes) => {
  const Action = sequelize.define("Action", {
    id: {
      type: DataTypes.INTEGER(2),
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    points: {
      type: DataTypes.INTEGER(8),
      allowNull: false,
      validate: {
        notEmpty: true,
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

  Action.associate = (models) => {
    Action.belongsToMany(models.User, {
      through: {
        model: models.UserAction,
        onDelete: "CASCADE",
        unique: false,
      },
    });
  };

  return Action;
};
