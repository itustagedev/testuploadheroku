const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('../config/config');
const memoireService = require('../services/memoire.service');
const routeService = require('../services/routes.service');
const logger = require('../helpers/logger');

/**
 * Save Memoire API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.hello = async (req, res) => {
    let data = {
        status : "ok",
        test : "ok"
    }
    res.status(200).json(data);
}
