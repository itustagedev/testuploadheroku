const { sequelize, DataTypes } = require('.');

const Options = sequelize.define('options', {
    IDOPTION: {
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
    tableName: 'options',
    timestamps: false
});

exports.Options = Options;