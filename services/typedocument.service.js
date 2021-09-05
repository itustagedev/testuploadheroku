const TypeDocumentRepository = require('../repositories/typedocument.repository');

/**
 * Get all active types document
 */
exports.getActiveTypes = async () => {
    const activeTypes = await TypeDocumentRepository.findAllActive();

    return activeTypes;
}