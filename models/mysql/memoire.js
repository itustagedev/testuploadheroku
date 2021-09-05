const { sequelize, DataTypes } = require('.');

const Memoire = sequelize.define('memoire', {
    IDMEMOIRE: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ESID: {
        type: DataTypes.STRING,
        unique: true
    },
    DATE: {
        type: DataTypes.DATE
    },
    NOMFICHIER: {
        type: DataTypes.STRING
    },
    STATUT: {
        type: DataTypes.ENUM('VALID', 'DRAFT', 'CORRECTED', 'WAITING', 'REJECTED', 'DELETED')
    },
    SURLIGNEMENTS: {
        type: DataTypes.JSON
    }
}, {
    tableName: 'memoire',
    timestamps: false
});

exports.Memoire = Memoire;