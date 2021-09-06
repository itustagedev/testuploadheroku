const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('../config/config');
const memoireService = require('../services/memoire.service');
const routeService = require('../services/routes.service');
const logger = require('../helpers/logger');
const { Client } = require('@elastic/elasticsearch');
const config = require('../config/config');
const client = require('../models/elasticsearch/client');

/**
 * Save Memoire API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.hello = async (req, res) => {
    const { body } = await client.search({
        index: 'game-of-thrones',
        body: {
          query: {
            match: { quote: 'winter' }
          }
        }
    })
    res.status(200).json(body.hits.hits);
}
