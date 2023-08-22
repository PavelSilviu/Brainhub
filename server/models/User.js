module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER(8),
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    lastName: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING(8),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    github: {
      type: DataTypes.STRING(40),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    photo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Post, {
      foreignKey: "UserId",
      onDelete: "CASCADE",
    });
    User.belongsToMany(models.Action, {
      through: {
        model: models.UserAction,
        onDelete: "CASCADE",
        unique: false,
      },
    });
    User.belongsToMany(models.User, {
      through: models.Follow,
      foreignKey: "followerId",
      as: "followers",
      onDelete: "CASCADE",
    });
    User.belongsToMany(models.User, {
      through: models.Follow,
      foreignKey: "followingId",
      as: "followings",
      onDelete: "CASCADE",
    });
    User.hasMany(models.Comment, { foreignKey: "userId", as: "commenter" });
  };

  return User; //practic creezi o functie si returnezi obiectul
};
