const simplecrypt = require("simplecrypt");

const settings = process.env.NODE_ENV === "production" ? require("../../settings") : require("../../settings-dev");

const sc = simplecrypt({
  password: settings.secret,
  salt: "10",
});

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      get() {
        try {
          return sc.decrypt(this.getDataValue("email"));
        } catch (e) {
          return this.getDataValue("email");
        }
      },
      set(val) {
        return this.setDataValue("email", sc.encrypt(val));
      },
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      required: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val) {
        return this.setDataValue("password", sc.encrypt(val));
      },
    },
    icon: {
      type: DataTypes.STRING,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
    },
  }, {
    freezeTableName: true,
  });

  User.associate = (models) => {
    // associations can be defined here
    models.User.hasMany(models.TeamRole, { foreignKey: "user_id" });
    models.User.hasMany(models.ProjectRole, { foreignKey: "user_id" });
    models.User.hasMany(models.TeamInvitation, { foreignKey: "user_id" });
    models.User.hasMany(models.ChartCache, { foreignKey: "user_id" });
  };

  return User;
};