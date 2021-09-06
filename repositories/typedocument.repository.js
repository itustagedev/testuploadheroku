const { TypeDocument } = require('../models/mysql/typedocument');

/**
 * Find all active types
 */
exports.findAllActive = async () => {
    const types = await TypeDocument.findAll({
        where: {
            STATUT_TYPE: 'ACTIVE'
        }
    });
    return types;
}