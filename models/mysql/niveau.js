const { sequelize, DataTypes } = require('.');

const Niveau = sequelize.define('niveau', {
    IDNIVEAU: {
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
    tableName: 'niveau',
    timestamps: false
});

exports.Niveau = Niveau;