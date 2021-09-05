const { sequelize, DataTypes } = require('.');

const TypeDocument = sequelize.define('typedocument', {
    IDTYPEDOCUMENT: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NOMTYPE: {
        type: DataTypes.STRING
    },
    STATUT_TYPE: {
        type: DataTypes.ENUM('ACTIVE', 'DELETED'),
        allowNull: false,
        defaultValue: 'ACTIVE'
    }
}, {
    tableName: 'typedocument',
    timestamps: false
});

exports.TypeDocument = TypeDocument;