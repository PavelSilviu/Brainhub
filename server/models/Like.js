module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define("Like", {
    id: {
      type: DataTypes.INTEGER(10),
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER(8),
      allowNull: false,
    },
  });

  Like.associate = (models) => {
    Like.belongsTo(models.Post, {
      onDelete: "CASCADE",
    });
    Like.belongsTo(models.User, {
      foreignKey: "userId",
      as: "liker",
      onDelete: "CASCADE",
    });
  };

  return Like;
};
