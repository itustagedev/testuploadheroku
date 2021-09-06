const client = require('../models/elasticsearch/db');

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
