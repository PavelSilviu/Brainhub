module.exports = (sequelize, DataTypes) => {
  const UserAction = sequelize.define(
    "UserAction",
    {
      id: {
        type: DataTypes.INTEGER(10),
        primaryKey: true,
        autoIncrement: true,
      },
      ActionId: {
        type: DataTypes.INTEGER(2),
        allowNull: false,
        unique: false,
      },
      UserId: {
        type: DataTypes.INTEGER(8),
        allowNull: false,
        unique: false,
      },
    },
    {
      indexes: [
        {
          unique: false, // Remove unique constraint
          fields: ["ActionId", "UserId"],
        },
      ],
    }
  );

  UserAction.associate = (models) => {
    UserAction.belongsTo(models.User, {
      foreignKey: "UserId",
      onDelete: "CASCADE",
    });
    UserAction.belongsTo(models.Action, {
      foreignKey: "ActionId",
      onDelete: "CASCADE",
    });
  };

  return UserAction;
};
