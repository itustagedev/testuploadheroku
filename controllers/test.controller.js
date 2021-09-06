const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('../config/config');
const memoireService = require('../services/memoire.service');
const routeService = require('../services/routes.service');
const logger = require('../helpers/logger');
const { Client } = require('@elastic/elasticsearch')

/**
 * Save Memoire API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.hello = async (req, res) => {
    const client = new Client({
        cloud: {
          id: "My_deployment:dXMtd2VzdDEuZ2NwLmNsb3VkLmVzLmlvJDNlYmZhMWI5MWIwNzQ4NDNhODE4ZDk2NTUzOWMwODgzJGRjMjQ2ZjQxMDZhNzQwYzg4YWUxNDI5MTI5N2Y0YThl"
        },
        auth: {
          username: "elastic",
          password: "nJpK2TvfZrNzChLliHMNyvFW"
        }
    })
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
