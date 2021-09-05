const express = require('express');
const memoireController = require('../controllers/memoire.controller');

const router = express.Router();

router.post('/', memoireController.saveMemoire);
router.post('/upload', memoireController.upload);
router.post('/upload/remove', memoireController.removeUploadedFile);
router.get('/:id/pdf', memoireController.getPdfMemoire);
router.get('/:id/copypaste', memoireController.verifyCopyPaste);
router.get('/:id/search', memoireController.findSentenceInAnotherBook);
router.put('/:id/correction', memoireController.sendCorrection);
router.delete('/:id/delete', memoireController.deleteDraftMemoire);
router.put('/:id/publish', memoireController.publishMemoire);
router.get('/:id/lastversioncorrected', memoireController.getMemoireCorrected);
router.post('/highlights', memoireController.addHighlight);
router.post('/highlights/areaupdate', memoireController.updateAreaHighlight);
router.post('/highlights/remove', memoireController.removeHighlight);
router.get('/:id/download', memoireController.download);

module.exports = router;