const { Memoire } = require('../models/mysql/memoire');
const { Fiche } = require('../models/mysql/fiche');
const { Utilisateur } = require('../models/mysql/utilisateur');
const { TypeDocument } = require('../models/mysql/typedocument');
const { Op } = require('sequelize');

/**
 * Create a new memoire
 * @param {Memoire} memoire New memoire to be created
 * 
 * @return {Memoire} Return newly created Memoire
 */
exports.create = async (memoire) => {
    const newMemoire = await Memoire.create(memoire);

    return newMemoire;
}

/**
 * Find by ElasticSearch Id
 * @param {String} esId Memoire EsId (ElasticSearch Id)
 * 
 * @return {Memoire}
 */
exports.findByEsId = async (esId) => {
    const memoire = await Memoire.findOne({
        where: {
            ESID: esId
        },
        include: [TypeDocument]
    });

    return memoire;
}

/**
 * Find by ElasticSearch Id, Etudiant Id and Memoire Statut
 * @param {String} esId Memoire EsId (ElasticSearch Id)
 * @param {Number} idEtudiant Etudiant Id
 * @param {String} statut Memoire Statut
 * 
 * @return {Memoire}
 */
exports.findByEsIdAndIdEtudiantAndStatut = async (esId, idEtudiant, statut) => {
    const memoire = await Memoire.findOne({
        where: {
            ESID: esId,
            '$fiche.IDETUDIANT$': idEtudiant,
            STATUT: statut
        },
        include: [
            {
                model: Fiche,
                include: [
                    {
                        model: Utilisateur,
                        foreignKey: 'IDETUDIANT',
                        as: 'Etudiant'
                    }
                ]
            },
            {
                model: TypeDocument
            }
        ]
    });

    return memoire;
}

/**
 * Find by ElasticSearch Id, Encadreur Id and Memoire Statut
 * @param {String} esId Memoire EsId (ElasticSearch Id)
 * @param {Number} idEncadreur Encadreur Id
 * @param {String} statut Memoire Statut
 * 
 * @return {Memoire}
 */
exports.findByEsIdAndIdEncadreurAndStatut = async (esId, idEncadreur, statut) => {
    const memoire = await Memoire.findOne({
        where: {
            ESID: esId,
            '$fiche.IDENCADREUR$': idEncadreur,
            STATUT: statut
        },
        include: [
            {
                model: Fiche,
                include: [
                    {
                        model: Utilisateur,
                        foreignKey: 'IDENCADREUR',
                        as: 'Encadreur'
                    }
                ]
            }
        ]
    });

    return memoire;
}

/**
 * Find by ElasticSearch Id and Exclude some Memoire Statut
 * @param {String} esId Memoire EsId (ElasticSearch Id)
 * @param {String} statut Memoire Statut to exclude
 * 
 * @return {Memoire}
 */
exports.findByEsIdAndExcludeStatut = async (esId, statut) => {
    const memoire = await Memoire.findOne({
        where: {
            ESID: esId,
            STATUT: {
                [Op.ne]: statut
            }
        },
        include: [TypeDocument]
    });

    return memoire;
}

/**
 * Find all by excluding statut
 * @param {String} statut Memoire Statut
 * 
 * @return {Array}
 */
exports.findAllByExcludeStatut = async (statut) => {
    const memoires = await Memoire.findAll({
        where: {
            STATUT: {
                [Op.ne]: statut
            }
        }
    });

    return memoires;
}

/**
 * Find all by esId or exclude statut
 * @param {String} esId Memoire EsId (ElasticSearch Id)
 * @param {String} statut Memoire Statut to exclude
 * 
 * @return {Array}
 */
exports.findAllByEsIdOrExcludeStatut = async (esId, statut) => {
    const memoires = await Memoire.findAll({
        where: {
            [Op.or]: [
                {
                    ESID: esId
                },
                {
                    STATUT: {
                        [Op.ne]: statut
                    }
                }
            ]
        },
        attributes: ['ESID']
    });

    return memoires;
}

/**
 * Find all by Etudiant Id or Exclude Statut
 * @param {Number} idEtudiant Etudiant Id
 * @param {String} statut Memoire Statut to exclude
 * 
 * @return {Array}
 */
exports.findAllByIdEtudiantOrExcludeStatut = async (idEtudiant, statut) => {
    const memoires = await Memoire.findAll({
        where: {
            [Op.or]: [
                {
                    '$fiche.IDETUDIANT$': idEtudiant
                },
                {
                    STATUT: {
                        [Op.ne]: statut
                    }
                }
            ]
        },
        attributes: ['ESID'],
        include: [
            {
                model: Fiche,
                include: [
                    {
                        model: Utilisateur,
                        foreignKey: 'IDETUDIANT',
                        as: 'Etudiant'
                    }
                ]
            }
        ]
    });

    return memoires;
}

/**
 * Find Etudiant of a Memoire
 * @param {String} esId Memoire EsId (ElasticSearch Id)
 * 
 * @return {Utilisateur}
 */
exports.findEtudiantByEsId = async (esId) => {
    const memoire = await Memoire.findOne({
        where: {
            ESID: esId
        },
        include: [Fiche]
    });

    const fiche = await memoire.getFiche();
    const etudiant = await fiche.getEtudiant();

    return etudiant;
}

/**
 * Find Encadreur of a Memoire
 * @param {String} esId Memoire EsId (ElasticSearch Id)
 * 
 * @return {Utilisateur}
 */
exports.findEncadreurByEsId = async (esId) => {
    const memoire = await Memoire.findOne({
        where: {
            ESID: esId
        },
        include: [Fiche]
    });

    const fiche = await memoire.getFiche();
    const encadreur = await fiche.getEncadreur();

    return encadreur;
}

/**
 * Find all memoires by Fiche Id, Etudiant Id and Memoire Statut
 * @param {Number} idFiche Fiche Id
 * @param {Number} idEtudiant Etudiant Id
 * @param {String} statut Memoire Statut
 * @param {Number} idTypeDocument TypeDocument Id
 * 
 * @return {Array}
 */
exports.checkIfAlreadyCorrected = async (idFiche, idEtudiant, statut, idTypeDocument) => {
    const memoires = await Memoire.findAll({
        where: {
            '$fiche.IDFICHE$': idFiche,
            '$fiche.IDETUDIANT$': idEtudiant,
            '$typedocument.IDTYPEDOCUMENT$': idTypeDocument,
            STATUT: statut
        },
        include: [
            {
                model: Fiche,
                include: [
                    {
                        model: Utilisateur,
                        foreignKey: 'IDETUDIANT',
                        as: 'Etudiant'
                    }
                ]
            },
            {
                model: TypeDocument
            }
        ]
    });

    return memoires;
}

/**
 * Find all by Fiche Id and Memoire Statut
 * @param {Number} idFiche Fiche Id
 * @param {String} statut Memoire Statut
 * @param {Number} idTypeDocument TypeDocument Id
 * 
 * @return {Array}
 */
exports.findAllByIdFicheAndStatut = async (idFiche, statut, idTypeDocument) => {
    const memoires = await Memoire.findAll({
        where: {
            '$fiche.IDFICHE$': idFiche,
            '$typeDocument.IDTYPEDOCUMENT$': idTypeDocument,
            STATUT: statut
        },
        include: [
            {
                model: Fiche
            },
            {
                model: TypeDocument
            }
        ]
    });

    return memoires;
}