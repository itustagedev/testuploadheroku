const { Fiche } = require('../models/mysql/fiche');

exports.findAll = async () => {
    const fiches = await Fiche.findAll();

    return fiches;
}

exports.findById = async (id) => {
    const fiche = await Fiche.findByPk(id);

    return fiche;
}