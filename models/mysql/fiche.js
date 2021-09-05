const { sequelize, DataTypes } = require('.');

const Fiche = sequelize.define('fiche', {
    IDFICHE: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    THEME: {
        type: DataTypes.STRING,
        allowNull: true
    },
    DESCRIPTION: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    DUREE: {
        type: DataTypes.DECIMAL,
        allowNull: true
    },
    SOCIETE: {
        type: DataTypes.STRING,
        allowNull: true
    },
    TACHE: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    NOMENCADREURPRO: {
        type: DataTypes.STRING,
        allowNull: false
    },
    CONTACTENCADREURPRO: {
        type: DataTypes.STRING,
        allowNull: false
    },
    EMAILENCADREURPRO: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    VALIDER: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    SESSIONAJOUT: {
        type: DataTypes.STRING,
        allowNull: false
    },
    autresmcd: {
        type: DataTypes.STRING,
        allowNull: true
    },
    autreslangage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    autrestechnologie: {
        type: DataTypes.STRING,
        allowNull: true
    },
    autresbdd: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_modif: {
        type: DataTypes.DATE,
        allowNull: false
    },
    etatAdmin: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    etatEtudiant: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    dateDebutStage: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    dateFinStage: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'fiche',
    timestamps: false
});

exports.Fiche = Fiche;