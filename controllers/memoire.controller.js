const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('../config/config');
const memoireService = require('../services/memoire.service');
const routeService = require('../services/routes.service');
const logger = require('../helpers/logger');

/**
 * Upload Memoire
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.upload = async (req, res) => {
    let decodedToken;
    try {
        decodedToken = routeService.verifyToken(req);
    } catch (err) {
        return res.status(403).send(err);
    }
    try {
        if (!req.files) {
            res.status(404).json({
                message: 'Veuillez uploader un fichier'
            });
        } else {
            fileName = decodedToken.IDETUDIANT + '-' + new Date().getTime() + '.pdf';
            fileName = await memoireService.upload(req.files.file, fileName);
            res.json({
                fileName: fileName
            });
            /* const [memoire, esId] = await memoireService.upload(req.files.file, fileName, decodedToken);
            memoire
                .then(data => {
                    return res.json(data);
                })
                .catch(async (err) => {
                    await memoireService.deleteEsMemoire(esId);
                    fs.unlink('./uploads/' + fileName, (error) => {
                        if (err) return res.status(500).json(error);
                        res.status(500).json(err);
                    });
                }); */
        }
    } catch (err) {
        fs.unlink('./uploads/' + fileName, (error) => {
            if (error) return res.status(500).json(error);
            res.status(500).json(err);
        });
    }
}

/**
 * Remove uploaded file API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.removeUploadedFile = async (req, res) => {
    let decodedToken;
    try {
        decodedToken = routeService.verifyToken(req);
    } catch (err) {
        return res.status(403).send(err);
    }
    const fileName = req.body.fileName;
    try {
        const isDeleted = await memoireService.removeUploadedFile(fileName);
        res.status(200).json({ isDeleted: isDeleted });
    } catch (err) {
        res.status(500).send();
    }
}

/**
 * Save Memoire API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.saveMemoire = async (req, res) => {
    let decodedToken;
    try {
        decodedToken = routeService.verifyToken(req);
    } catch (err) {
        return res.status(403).send(err);
    }
    const fileName = req.body.fileName;
    const type = req.body.type;
    const idFiche = decodedToken.IDFICHE;
    try {
        const newMemoire = await memoireService.saveMemoire(fileName, idFiche, type);
        res.status(200).json(newMemoire);
    } catch (err) {
        // logger.error("--------------"+err+"---------------");
        // fs.unlink('./uploads/' + fileName, (error) => {
        //     if (err) res.status(500).json(error);
        // });
        res.status(500).json(err);
    }
}

/**
 * Get Memoire Pdf API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.getPdfMemoire = async (req, res) => {
    let token = req.headers['authorization'];
    let decodedToken;
    try {
        token = token.slice(7, token.length);
        decodedToken = jwt.verify(token, config.JWT_PASSPHRASE);
    } catch (err) {
        return res.status(403).send(err);
    }
    const esIdMemoire = req.params.id;
    const memoire = await memoireService.findMemoireById(esIdMemoire);
    if (memoire != null) {
        if (fs.existsSync('./uploads/' + memoire.NOMFICHIER)) {
            try {
                const pdfData = await memoireService.getMemoirePdf(memoire);
                if (decodedToken.IDETUDIANT) {
                    const alreadyCorrected = await memoireService.checkIf(memoire.IDFICHE, decodedToken.IDETUDIANT, 'CORRECTED', memoire.typedocument.IDTYPEDOCUMENT);
                    const alreadyValid = await memoireService.checkIf(memoire.IDFICHE, decodedToken.IDETUDIANT, 'VALID', memoire.typedocument.IDTYPEDOCUMENT);
                    const waiting = await memoireService.checkIf(memoire.IDFICHE, decodedToken.IDETUDIANT, 'WAITING', memoire.typedocument.IDTYPEDOCUMENT);
                    return res.status(200).json({
                        pdfData: pdfData,
                        memoire: memoire,
                        alreadyCorrected: alreadyCorrected,
                        alreadyValid: alreadyValid,
                        waiting: waiting
                    });
                }
                return res.status(200).json({
                    pdfData: pdfData,
                    memoire: memoire,
                    alreadyCorrected: false,
                    alreadyValid: false,
                    waiting: false
                });
            } catch (error) {
                res.status(500).send(error);
            }
        }
        return res.status(404).send();
    }

    return res.status(404).send();
}

/**
 * Verify copy paste API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.verifyCopyPaste = async (req, res) => {
    let decodedToken;
    try {
        decodedToken = routeService.verifyToken(req);
    } catch (err) {
        return res.status(403).send(err);
    }
    const esIdMemoire = req.params.id;
    const sentences = await memoireService.verifyCopyPaste(esIdMemoire, decodedToken.IDETUDIANT);

    res.status(200).json(sentences);
}

/**
 * Find a sentence in another book API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.findSentenceInAnotherBook = async (req, res) => {
    let decodedToken;
    try {
        decodedToken = routeService.verifyToken(req);
    } catch (err) {
        return res.status(403).send(err);
    }

    const sentence = req.query.q;
    if (sentence === undefined) {
        return res.status(400).send('Bad request');
    }
    const sentences = await memoireService.findSentenceInAnotherBook(decodedToken.IDETUDIANT, sentence);

    res.status(200).json(sentences);
}

/**
 * Send correction API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.sendCorrection = async (req, res) => {
    let decodedToken;
    try {
        decodedToken = routeService.verifyToken(req);
    } catch (err) {
        return res.status(403).send(err);
    }

    const esIdMemoire = req.params.id;
    const highlights = req.body.highlights;
    const idEncadreur = decodedToken.IDENCADREUR;

    try {
        const result = await memoireService.sendCorrection(esIdMemoire, idEncadreur, highlights);

        res.status(200).json(result);
    } catch (err) {
        res.status(500).send(err);
    }
}

/**
 * Delete draft API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.deleteDraftMemoire = async (req, res) => {
    let decodedToken;
    try {
        decodedToken = routeService.verifyToken(req);
    } catch (err) {
        return res.status(403).send(err);
    }

    const esIdMemoire = req.params.id;
    const idEtudiant = decodedToken.IDETUDIANT;

    try {
        const result = await memoireService.deleteDraft(esIdMemoire, idEtudiant);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).send(err);
    }
}

/**
 * Publish Memoire to be corrected API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.publishMemoire = async (req, res) => {
    let decodedToken;
    try {
        decodedToken = routeService.verifyToken(req);
    } catch (err) {
        return res.status(403).send(err);
    }

    const esIdMemoire = req.params.id;
    const idEtudiant = decodedToken.IDETUDIANT;

    try {
        const result = await memoireService.publishMemoire(esIdMemoire, idEtudiant);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

/**
 * Get Memoire already corrected API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.getMemoireCorrected = async (req, res) => {
    let token = req.headers['authorization'];
    let decodedToken;
    try {
        token = token.slice(7, token.length);
        decodedToken = jwt.verify(token, config.JWT_PASSPHRASE);
    } catch (err) {
        return res.status(403).send(err);
    }
    const esIdMemoire = req.params.id;
    try {
        const memoire = await memoireService.findMemoireCorrected(esIdMemoire);
        if (fs.existsSync('./uploads/' + memoire.NOMFICHIER)) {
            try {
                const pdfData = await memoireService.getMemoirePdf(memoire);
                return res.status(200).json({
                    pdfData: pdfData,
                    memoire: memoire
                });
            } catch (error) {
                res.status(500).send();
            }
        } else {
            res.status(404).send();
        }
    } catch (err) {
        res.status(404).send(err);
    }
}

/**
 * Add highlight API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.addHighlight = async (req, res) => {
    let decodedToken;
    try {
        decodedToken = routeService.verifyToken(req);
    } catch (err) {
        console.log(err);
        return res.status(403).send(err);
    }
    const esIdMemoire = req.body.esIdMemoire;
    const highlight = req.body.highlight;

    try {
        const newHighlight = await memoireService.addHighlight(esIdMemoire, highlight, decodedToken.IDENCADREUR);

        res.status(200).json(newHighlight);
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}

/**
 * Update area highlight API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.updateAreaHighlight = async (req, res) => {
    let decodedToken;
    try {
        decodedToken = routeService.verifyToken(req);
    } catch (err) {
        return res.status(403).send(err);
    }
    const esIdMemoire = req.body.esIdMemoire;
    const idHiglight = req.body.idHighlight;
    const position = req.body.position;
    const content = req.body.content;

    try {
        const updatedHighlight = await memoireService.updateAreaHiglight(esIdMemoire, idHiglight, position, content);

        res.status(200).json(updatedHighlight);
    } catch (err) {
        res.status(500).send();
    }
}

/**
 * Remove highlight API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.removeHighlight = async (req, res) => {
    let decodedToken;
    try {
        decodedToken = routeService.verifyToken(req);
    } catch (err) {
        return res.status(403).send(err);
    }
    const esIdMemoire = req.body.esIdMemoire;
    const idHiglight = req.body.idHighlight;

    try {
        await memoireService.removeHighlight(esIdMemoire, idHiglight);

        res.status(200).json('OK');
    } catch (err) {
        console.log("err ==> ", err);
        res.status(500).send();
    }
}

/**
 * Download API
 * @param {Request} req Request
 * @param {Response} res Response
 */
exports.download = async (req, res) => {
    let decodedToken;
    try {
        decodedToken = routeService.verifyToken(req);
    } catch (err) {
        return res.status(403).send(err);
    }

    const esIdMemoire = req.params.id;
    const memoire = await memoireService.findMemoireById(esIdMemoire);
    if (memoire != null) {
        try {
            let highlights = (memoire.SURLIGNEMENTS != null) ? memoire.SURLIGNEMENTS : [];
            highlights = (memoire.STATUT === 'WAITING') ? [] : highlights;

            const data = await memoireService.download(memoire.NOMFICHIER, highlights);

            res.setHeader('Content-Type', 'application/pdf');
            res.end(Buffer.from(data));
        } catch (error) {
            console.log("err ==> ", error);
            res.status(500).send();
        }

    }
    return res.status(404).send();
}