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
        "types" : "ok"
    }
    res.json(types);
}