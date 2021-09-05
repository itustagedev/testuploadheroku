const routeService = require('../services/routes.service');
const typeDocumentService = require('../services/typedocument.service');

exports.getActiveTypes = async (req, res) => {
    // let decodedToken;
    // try {
    //     decodedToken = routeService.verifyToken(req);
    // } catch (err) {
    //     return res.status(403).send(err);
    // }

    // const types = await typeDocumentService.getActiveTypes();
    const types = {
        "IDTYPEDOCUMENT" : "1",
        "NOM TYPE" : "Memoire complet MC",
        "STATUT_TYPE" : "ACTIVE"
    }
    res.json(types);
}