module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("Post", {
    id: {
      type: DataTypes.INTEGER(5),
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: DataTypes.STRING(255),
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
    link: {
      type: DataTypes.STRING(40),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, {
      onDelete: "CASCADE",
    });

    Post.hasMany(models.Like, {
      foreignKey: "PostId",
      onDelete: "CASCADE",
    });

    Post.hasMany(models.Comment, {
      foreignKey: "PostId",
      onDelete: "CASCADE",
    });
  };

  return Post; //practic creezi o functie si returnezi obiectul
};
