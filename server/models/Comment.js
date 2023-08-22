module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define("Comment", {
    id: {
      type: DataTypes.INTEGER(10),
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER(8),
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Post, { onDelete: "CASCADE" });
    Comment.belongsTo(models.User, {
      foreignKey: "userId",
      as: "commenter",
      onDelete: "CASCADE",
    });
  };

  return Comment;
};
