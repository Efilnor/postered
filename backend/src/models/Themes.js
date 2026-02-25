module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Themes",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING },
    },
    { tableName: "themes", schema: "public", timestamps: false },
  );
};
