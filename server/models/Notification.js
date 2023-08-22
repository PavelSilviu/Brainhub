module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    id: {
      type: DataTypes.INTEGER(10),
      primaryKey: true,
      autoIncrement: true,
    },
    notificatedId: {
      type: DataTypes.INTEGER(8),
      allowNull: false,
    },
    notificatingId: {
      type: DataTypes.INTEGER(8),
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    viewed: {
      type: DataTypes.ENUM("yes", "no"),
      defaultValue: "no",
    },
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: "notificatedId",
      as: "notificated",
      onDelete: "CASCADE",
    });
    Notification.belongsTo(models.User, {
      foreignKey: "notificatingId",
      as: "notificating",
      onDelete: "CASCADE",
    });
    Notification.belongsTo(models.Post, {
      foreignKey: "postId",
      onDelete: "CASCADE",
    });
  };

  return Notification;
};
