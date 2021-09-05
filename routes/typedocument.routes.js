const express = require('express');
const typeDocumentController = require('../controllers/typedocument.controller');

const router = express.Router();

router.get('/', typeDocumentController.getActiveTypes);

module.exports = router;