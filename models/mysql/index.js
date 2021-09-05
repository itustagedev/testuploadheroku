const dbConfig = require('../../config/db.config');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: '0'
});

const db = {};

db.Sequelize = Sequelize;
db.DataTypes = DataTypes;
db.sequelize = sequelize;

// Exports Database
module.exports = db;

//--------------------------------------------------------

// Import Models
const { Utilisateur } = require('./utilisateur');
const { Promotion } = require('./promotion');
const { Fiche } = require('./fiche');
const { Options } = require('./options');
const { Niveau } = require('./niveau');
const { Memoire } = require('./memoire');
const { TypeDocument } = require('./typedocument');

//--------------------------------------------------------

// Define relationship

// Utilisateur and Promotion : One to Many
Utilisateur.belongsTo(Promotion, {
    foreignKey: 'IDPROMOTION'
});
Promotion.hasMany(Utilisateur, {
    foreignKey: 'IDPROMOTION'
});

//--------------------------------------------------

// Fiche and Options : One to Many
Fiche.belongsTo(Options, {
    foreignKey: 'IDOPTION'
});
Options.hasMany(Fiche, {
    foreignKey: 'IDOPTION'
});

// Fiche and Niveau : One to Many
Fiche.belongsTo(Niveau, {
    foreignKey: 'IDNIVEAU'
});
Niveau.hasMany(Fiche, {
    foreignKey: 'IDNIVEAU'
});

// Fiche and Etudiant : One to Many
Fiche.belongsTo(Utilisateur, {
    foreignKey: 'IDETUDIANT',
    as: 'Etudiant'
});
Utilisateur.hasMany(Fiche, {
    foreignKey: 'IDETUDIANT',
    as: 'Etudiant'
});

// Fiche and Encadreur : One to Many
Fiche.belongsTo(Utilisateur, {
    foreignKey: 'IDENCADREUR',
    as: 'Encadreur'
});
Utilisateur.hasMany(Fiche, {
    foreignKey: 'IDENCADREUR',
    as: 'Encadreur'
});

//--------------------------------------------------

// Memoire and Fiche : One to Many
Memoire.belongsTo(Fiche, {
    foreignKey: 'IDFICHE'
});
Fiche.hasMany(Memoire, {
    foreignKey: 'IDFICHE'
});

// Memoire and TypeDocument : One to Many
Memoire.belongsTo(TypeDocument, {
    foreignKey: 'IDTYPEDOCUMENT'
});
TypeDocument.hasMany(Memoire, {
    foreignKey: 'IDTYPEDOCUMENT'
});