const mysqlDb = require('../models/mysql');

exports.findUtilisateur = async (idUtilisateur) => {
    const utilisateur = await mysqlDb.sequelize.query('SELECT * from utilisateur WHERE IDETUDIANT = :idUtilisateur', {
        replacements: {
            idUtilisateur: idUtilisateur
        },
        type: mysqlDb.Sequelize.QueryTypes.SELECT
    });

    return (utilisateur.length > 0) ? utilisateur[0] : null;
} 