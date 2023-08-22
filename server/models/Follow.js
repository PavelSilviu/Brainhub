module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define(
    "Follow",
    {
      id: {
        type: DataTypes.INTEGER(10),
        primaryKey: true,
        autoIncrement: true,
      },
      followerId: {
        type: DataTypes.INTEGER(8),
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      followingId: {
        type: DataTypes.INTEGER(8),
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"),
        defaultValue: "pending",
      },
      requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      uniqueKeys: {
        unique_follow: {
          fields: ["followerId", "followingId"],
        },
      },
    }
  );

  Follow.associate = (models) => {
    Follow.belongsTo(models.User, {
      foreignKey: "followerId",
      as: "followers",
      onDelete: "CASCADE",
    });
    Follow.belongsTo(models.User, {
      foreignKey: "followingId",
      as: "followings",
      onDelete: "CASCADE",
    });
  };

  return Follow;
};
