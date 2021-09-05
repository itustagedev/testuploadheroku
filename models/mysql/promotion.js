const { sequelize, DataTypes } = require('.');

const Promotion = sequelize.define('promotion', {
    IDPROMOTION: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    VAL: {
        type: DataTypes.INTEGER
    },
    DESCE: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'promotion',
    timestamps: false
});

exports.Promotion = Promotion;