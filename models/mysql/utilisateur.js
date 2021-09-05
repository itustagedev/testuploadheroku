const { sequelize, DataTypes } = require('.');

const Utilisateur = sequelize.define('utilisateur', {
    IDETUDIANT: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NOM: {
        type: DataTypes.INTEGER
    },
    PRENOM: {
        type: DataTypes.STRING
    },
    IDENTIFIANT: {
        type: DataTypes.STRING
    },
    EMAIL: {
        type: DataTypes.STRING
    },
    MDP: {
        type: DataTypes.STRING
    },
    STATUT: {
        type: DataTypes.INTEGER
    },
    NIVEAU: {
        type: DataTypes.STRING
    },
    SEXE: {
        type: DataTypes.STRING
    },
    REMARQUE: {
        type: DataTypes.TEXT
    },
    PROFILE: {
        type: DataTypes.ENUM('ADMIN', 'ENSEIGNANT', 'ETUDIANT')
    },
    INITIALE: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'utilisateur',
    timestamps: false
});

exports.Utilisateur = Utilisateur;