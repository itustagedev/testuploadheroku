const { Client } = require('@elastic/elasticsearch');
const dbConfig = require('../../config/elasticdb.config');

/*const client = new Client({
    node: dbConfig.NODE,
    auth: dbConfig.AUTH
});*/

// Using elastic cloud
const client = new Client({
    cloud: {
        id: dbConfig.CLOUDID
    },
    auth: dbConfig.AUTH
});

module.exports = client;