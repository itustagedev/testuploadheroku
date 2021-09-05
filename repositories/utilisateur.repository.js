const { Utilisateur } = require('../models/mysql/utilisateur');

exports.findById = async (idUtilisateur) => {
    const utilisateur = await Utilisateur.findByPk(idUtilisateur);

    return utilisateur;
}