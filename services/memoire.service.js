const pdfToBase64 = require('pdf-to-base64');
const atob = require('atob');
const nlp = require('wink-nlp-utils');
const pdfjs = require('pdfjs-dist/es5/build/pdf');
const mysqlDb = require('../models/mysql');
const elasticMemoireModele = require('../models/elasticsearch/memoire');
const emailService = require('./email.service');
const fs = require('fs');
const fsPromises = fs.promises;
const annotpdf = require('annotpdf');

const { Memoire } = require('../models/mysql/memoire');

const FicheRepository = require('../repositories/fiche.repository');
const MemoireRepository = require('../repositories/memoire.repository');
const UtilisateurRepository = require('../repositories/utilisateur.repository');

const { getDocument } = require('../libs/pdf');

/**
 * Extract all texts in a pdf file
 * @param {String} filePath FilePath
 */
exports.getPdfText = async (filePath) => {
    let text = '';
    const pdf = await pdfjs.getDocument(filePath).promise;
    const numPages = pdf.numPages;
    for (let i = 1; i <= numPages; i++) {
        let page = await pdf.getPage(i);
        let textContent = await page.getTextContent();
        let textItems = textContent.items;
        let finalString = '';
        for (let j = 0; j < textItems.length; j++) {
            let item = textItems[j];
            finalString += item.str;
        }
        finalString = nlp.string.removeExtraSpaces(finalString);
        text += finalString;
    }

    return text;
}

/**
 * Extract pdf texts per page
 * @param {String} filePath FilePath
 */
exports.getPdfTextPerPage = async (filePath) => {
    let texts = [];
    const pdf = await pdfjs.getDocument(filePath).promise;
    const numPages = pdf.numPages;
    for (let i = 1; i <= numPages; i++) {
        let page = await pdf.getPage(i);
        let textContent = await page.getTextContent();
        let textItems = textContent.items;
        let finalString = '';
        for (let j = 0; j < textItems.length; j++) {
            let item = textItems[j];
            finalString += item.str;
        }
        finalString = nlp.string.removeExtraSpaces(finalString);
        texts.push({
            page: i,
            content: finalString
        });
    }

    return texts;
}

/**
 * Upload a file to uploads directory
 * @param {File} file File
 * @param {String} fileName File name
 */
exports.upload = async (file, fileName) => {
    await file.mv('./uploads/' + fileName);

    return fileName;
}

/**
 * Remove uploaded file
 * @param {String} fileName File name
 */
exports.removeUploadedFile = (fileName) => {
    return new Promise((resolve, reject) => {
        fs.unlink('./uploads/' + fileName, (error) => {
            if (error) {
                reject(error);
            }
            resolve(true);
        });
    });
}

/**
 * Save Memoire to Database and index it in ElasticSearch
 * @param {String} fileName File name
 * @param {Number} idFiche Fiche id
 * @param {TypeDocument} type Type document
 */
exports.saveMemoire = async (fileName, idFiche, type) => {
    return {
        "hey" : "ok"
    }
    // const content = await this.getPdfText('uploads/' + fileName);
    // const memoire = await elasticMemoireModele.indexMemoire(content);
    // const esId = memoire.body['_id'];

    // try {
    //     const fiche = await FicheRepository.findById(idFiche);
    //     if (fiche == null) {
    //         throw new Error('Fiche not found');
    //     }
    //     const newMemoire = {
    //         ESID: esId,
    //         DATE: new Date(),
    //         NOMFICHIER: fileName,
    //         STATUT: 'DRAFT',
    //         IDFICHE: idFiche,
    //         IDTYPEDOCUMENT: type.IDTYPEDOCUMENT
    //     };

    //     const newlyCreatedMemoire = await MemoireRepository.create(newMemoire);
    //     const textsPerPage = await this.getPdfTextPerPage('uploads/' + fileName);
    //     for (let index = 0; index < textsPerPage.length; index++) {
    //         const text = textsPerPage[index];
    //         await elasticMemoireModele.indexMemoireTexte(esId, text);
    //     }
    //     return newlyCreatedMemoire;
    // } catch (err) {
    //     await this.deleteEsMemoire(esId);
    //     throw err;
    // }
}

/**
 * Delete memoire indexed in ElasticSearch
 * @param {String} esIdMemoire Memoire EsId (ElasticSearch Id)
 */
exports.deleteEsMemoire = async (esIdMemoire) => {
    const result = await elasticMemoireModele.deleteMemoire(esIdMemoire);

    return result;
}

/**
 * Find Memoire by EsId
 * @param {String} esIdMemoire Memoire EsId (ElasticSearch Id)
 * 
 * @return {Memoire}
 */
exports.findMemoireById = async (esIdMemoire) => {
    const memoire = await MemoireRepository.findByEsIdAndExcludeStatut(esIdMemoire, 'DELETED');

    return memoire;
}

/**
 * Find content of a Memoire
 * @param {String} esIdMemoire Memoire EsId (ElasticSearch Id)
 * 
 * @return {String}
 */
exports.findMemoireContentById = async (esIdMemoire) => {
    const { body } = await elasticMemoireModele.getMemoire(esIdMemoire);
    const result = nlp.string.removeExtraSpaces(body._source.content);

    return result;
}

/**
 * Get Memoire pdf file base64 encoded
 * @param {Memoire} memoire Memoire
 * 
 * @return {String}
 */
exports.getMemoirePdf = async (memoire) => {
    const base64 = await pdfToBase64('uploads/' + memoire.NOMFICHIER);
    return atob(base64);
}

/**
 * Verify copy paste
 * @param {String} esIdMemoire Memoire EsId (ElasticSearch Id)
 * @param {Number} idEtudiant Etudiant Id
 */
exports.verifyCopyPaste = async (esIdMemoire, idEtudiant) => {
    const content = await this.findMemoireContentById(esIdMemoire);
    const sentences = nlp.string.sentences(content);

    let esIdsToExclude;

    if (idEtudiant == null) {
        esIdsToExclude = await MemoireRepository.findAllByEsIdOrExcludeStatut(esIdMemoire, 'VALID');
    } else {
        esIdsToExclude = await MemoireRepository.findAllByIdEtudiantOrExcludeStatut(idEtudiant, 'VALID');
    }
    esIdsToExclude = esIdsToExclude.map(element => element.ESID);

    const sentencesCopied = [];
    for (let index = 0; index < sentences.length; index++) {
        const sentence = sentences[index];
        const copied = await elasticMemoireModele.findCopyPaste(esIdsToExclude, sentence);
        if (copied.hits.total.value > 0) {
            const copiedSentence = await elasticMemoireModele.findSentencePages(esIdMemoire, sentence);
            if (copiedSentence.hits.total.value > 0) {
                const pages = copiedSentence.hits.hits.map(element => element._source.pageTexte.page);
                if (pages.every(el => el > 10)) {
                    sentencesCopied.push({
                        sentence: sentence,
                        pages: pages
                    });
                }
            }
        }
    }

    return sentencesCopied;
}

/**
 * Find a sentence in another book
 * @param {Number} idEtudiant Etudiant Id
 * @param {String} sentence Sentence
 */
exports.findSentenceInAnotherBook = async (idEtudiant, sentence) => {
    let esIdsToExclude;
    if (idEtudiant == null) {
        esIdsToExclude = await mysqlDb.sequelize.query('SELECT distinct(esid) from v_memoire WHERE statut != :statut', {
            replacements: {
                statut: 'VALID'
            },
            type: mysqlDb.Sequelize.QueryTypes.SELECT
        });
    } else {
        esIdsToExclude = await mysqlDb.sequelize.query('SELECT distinct(esid) from v_memoire WHERE statut != :statut OR idetudiant = :idEtudiant ', {
            replacements: {
                statut: 'VALID',
                idEtudiant: idEtudiant
            },
            type: mysqlDb.Sequelize.QueryTypes.SELECT
        });
    }
    esIdsToExclude = esIdsToExclude.map(element => element.esid);

    const copiedSentences = await elasticMemoireModele.findSentencePagesInAnotherBook(esIdsToExclude, sentence);
    let sentences = [];
    if (copiedSentences.hits.total.value > 0) {
        sentences = copiedSentences.hits.hits.map(element => {
            return {
                page: element._source.pageTexte.page,
                esId: element._source.my_join_field.parent
            }
        });
    }
    let sentencesWithUserInfo = [];
    const sqlQuery = 'SELECT theme, nom, prenom from v_memoire JOIN utilisateur ON utilisateur.idetudiant = v_memoire.idetudiant WHERE esid = :esId';
    for (let index = 0; index < sentences.length; index++) {
        const s = sentences[index];
        let etudiant = await mysqlDb.sequelize.query(sqlQuery, {
            replacements: {
                esId: s.esId
            },
            type: mysqlDb.Sequelize.QueryTypes.SELECT
        });
        sentencesWithUserInfo.push({
            ...s,
            ...etudiant[0]
        });
    }

    return sentencesWithUserInfo;
}

/**
 * Delete a draft
 * @param {String} esIdMemoire Memoire EsId (ElasticSearch Id)
 * @param {Number} idEtudiant Etudiant Id
 */
exports.deleteDraft = async (esIdMemoire, idEtudiant) => {
    const draft = await MemoireRepository.findByEsIdAndIdEtudiantAndStatut(esIdMemoire, idEtudiant, 'DRAFT');

    if (draft == null) {
        throw new Error('Not allowed to delete');
    }
    const deletedMemoire = await Memoire.update({ STATUT: 'DELETED' }, { where: { ESID: esIdMemoire } });

    return deletedMemoire;
}

/**
 * Check if fiche has a Memoire Statut
 * @param {Number} idFiche Fiche Id
 * @param {Number} idEtudiant Etudiant Id
 * @param {String} statut Memoire Statut
 * @param {Number} idTypeDocument TypeDocument Id
 */
exports.checkIf = async (idFiche, idEtudiant, statut, idTypeDocument) => {
    const memoires = await MemoireRepository.checkIfAlreadyCorrected(idFiche, idEtudiant, statut, idTypeDocument);

    return memoires.length > 0;
}

/**
 * Send Memoire to be corrected
 * @param {String} esIdMemoire Memoire EsId (ElasticSearch Id)
 * @param {Number} idEtudiant Etudiant Id
 */
exports.publishMemoire = async (esIdMemoire, idEtudiant) => {
    const draft = await MemoireRepository.findByEsIdAndIdEtudiantAndStatut(esIdMemoire, idEtudiant, 'DRAFT');

    if (draft == null) {
        throw new Error('Not allowed to publish');
    }
    const alreadyValid = await this.checkIf(draft.IDFICHE, idEtudiant, 'VALID', draft.typedocument.IDTYPEDOCUMENT);
    if (alreadyValid) {
        throw new Error('Already valid');
    }
    const waiting = await this.checkIf(draft.IDFICHE, idEtudiant, 'WAITING', draft.typedocument.IDTYPEDOCUMENT);
    if (waiting) {
        throw new Error('Waiting to be corrected');
    }
    const encadreur = await MemoireRepository.findEncadreurByEsId(esIdMemoire);
    const etudiant = await UtilisateurRepository.findById(idEtudiant);

    const statut = (await this.checkIf(draft.IDFICHE, idEtudiant, 'CORRECTED', draft.typedocument.IDTYPEDOCUMENT)) ? 'VALID' : 'WAITING';
    const publishedMemoire = await Memoire.update({ STATUT: statut }, { where: { ESID: esIdMemoire } });

    const nomEtudiant = (etudiant.PRENOM != null) ? `${etudiant.NOM} ${etudiant.PRENOM}` : etudiant.NOM;
    let messageContent = (statut === 'VALID') ? `la version finale de son mémoire du type : <b>${draft.typedocument.NOMTYPE}</b>.` : `son mémoire du type : <b>${draft.typedocument.NOMTYPE}</b> pour correction.`;
    const message = `
        <p>Bonjour,</p>
        <p>L'étudiant <b>${nomEtudiant} ${etudiant.IDENTIFIANT}</b> a envoyé ${messageContent}</p>
        <p>Cordialement</p>
    `;
    emailService.sendEmail(encadreur.EMAIL, 'Stage IT-University Memoire', message);

    return publishedMemoire;
}

/**
 * Send correction to Etudiant
 * @param {String} esIdMemoire Memoire EsId (ElasticSearch Id)
 * @param {Number} idEncadreur Encadreur Id
 * @param {Array} highlights Memoire highlights
 */
exports.sendCorrection = async (esIdMemoire, idEncadreur, highlights) => {
    const waiting = await MemoireRepository.findByEsIdAndIdEncadreurAndStatut(esIdMemoire, idEncadreur, 'WAITING');

    if (waiting == null) {
        throw new Error('Not allowed to correct');
    }

    const etudiant = await MemoireRepository.findEtudiantByEsId(esIdMemoire);
    const updatedMemoire = await Memoire.update({ STATUT: 'CORRECTED', SURLIGNEMENTS: highlights }, { where: { ESID: esIdMemoire } });

    const nomEtudiant = (etudiant.PRENOM != null) ? `${etudiant.NOM} ${etudiant.PRENOM}` : etudiant.NOM;
    const message = `
        <p>Bonjour ${nomEtudiant},</p>
        <p>Votre encadreur a corrigé votre memoire.</p>
        <p>Cordialement</p>
    `;
    emailService.sendEmail(etudiant.EMAIL, 'Stage IT-University Memoire', message);

    return updatedMemoire;
}

/**
 * Find memoire corrected
 * @param {String} esIdMemoire Memoire EsId (ElasticSearch Id)
 */
exports.findMemoireCorrected = async (esIdMemoire) => {
    const finalVersion = await MemoireRepository.findByEsId(esIdMemoire);
    if (finalVersion == null) {
        throw new Error('Cannot find the final version');
    }
    const memoires = await MemoireRepository.findAllByIdFicheAndStatut(finalVersion.IDFICHE, 'CORRECTED', finalVersion.typedocument.IDTYPEDOCUMENT);
    if (memoires.length != 1) {
        throw new Error('Cannot find the last corrected these');
    }

    return memoires[0];
}

/**
 * Add a highlight
 * @param {String} esIdMemoire Memoire EsId (ElasticSearch Id)
 * @param {Object} highlight Higlight
 */
exports.addHighlight = async (esIdMemoire, highlight, idEncadreur) => {
    let memoire = await MemoireRepository.findByEsId(esIdMemoire);

    let encadreur = await UtilisateurRepository.findById(idEncadreur);

    let highlights = (memoire.SURLIGNEMENTS == null) ? [] : JSON.parse(memoire.SURLIGNEMENTS);
    highlight = {
        encadreur: {
            idEncadreur: encadreur.IDETUDIANT,
            initiale: encadreur.INITIALE
        },
        ...highlight
    };
    console.log("Highlight : ",highlights);
    highlights.push(highlight);
    memoire.SURLIGNEMENTS = highlights;

    memoire = await memoire.save();

    return highlight;
}

/**
 * Update area highlight
 * @param {String} esIdMemoire Memoire EsId (ElasticSearch Id)
 * @param {String} idHighlight Highlight Id
 * @param {Object} position Highlight position
 * @param {Object} content Highlight content
 */
exports.updateAreaHiglight = async (esIdMemoire, idHighlight, position, content) => {
    let memoire = await MemoireRepository.findByEsId(esIdMemoire);

    let highlights = (memoire.SURLIGNEMENTS == null) ? [] : memoire.SURLIGNEMENTS;
    highlights = highlights.map(h => {
        return h.id == idHighlight
            ? {
                ...h,
                position: { ...h.position, ...position },
                content: { ...h.content, ...content }
            }
            : h;
    });

    memoire.SURLIGNEMENTS = highlights;

    memoire = await memoire.save();

    return highlights.find(h => h.id == idHighlight);
}

/**
 * Remove an highlight
 * @param {String} esIdMemoire Memoire EsId (ElasticSearch Id)
 * @param {String} idHighlight Highlight Id
 */
exports.removeHighlight = async (esIdMemoire, idHighlight) => {
    let memoire = await MemoireRepository.findByEsId(esIdMemoire);

    let highlights = (memoire.SURLIGNEMENTS == null) ? [] : memoire.SURLIGNEMENTS;
    highlights = highlights.filter(h => {
        return h.id != idHighlight
    });

    memoire.SURLIGNEMENTS = highlights;

    memoire = await memoire.save();

    return highlights;
}

/**
 * Download
 * @param {String} fileName Filename
 * @param {Array} highlights Highlights array
 */
exports.download = async (fileName, highlights) => {
    const pdfDocument = await getDocument('./uploads/' + fileName).promise;
    let file = await fsPromises.readFile('./uploads/' + fileName);
    let pdfFactory = new annotpdf.AnnotationFactory(file);
    for (let i = 0; i < highlights.length; i++) {
        const highlight = highlights[i];
        const page = await pdfDocument.getPage(highlight.position.pageNumber);
        const pageNumber = highlight.position.pageNumber - 1;
        const initial = highlight.encadreur.initiale;
        const comment = highlight.comment.text;
        const viewport = page.getViewport({ scale: 1 });
        const width = viewport.width;
        const height = viewport.height;
        if (highlight.position.rects.length > 0) {
            for (let j = 0; j < highlight.position.rects.length; j++) {
                const rect = highlight.position.rects[j];
                const scaledWidth = rect.width;
                const scaledHeight = rect.height;
                const scaledX1 = rect.x1;
                const scaledX2 = rect.x2;
                const scaledY1 = rect.y1;
                const scaledY2 = rect.y2;
                const x1 = (width * scaledX1) / scaledWidth;
                const x2 = (width * scaledX2) / scaledWidth;
                const y1 = height - ((height * scaledY1) / scaledHeight);
                const y2 = height - ((height * scaledY2) / scaledHeight);
                pdfFactory.createHighlightAnnotation(pageNumber, [x1, y1, x2, y2], comment, initial, { r: 255, g: 226, b: 143 });
            }
        } else {
            const rect = highlight.position.boundingRect;
            const scaledWidth = rect.width;
            const scaledHeight = rect.height;
            const scaledX1 = rect.x1;
            const scaledX2 = rect.x2;
            const scaledY1 = rect.y1;
            const scaledY2 = rect.y2;
            const x1 = (width * scaledX1) / scaledWidth;
            const x2 = (width * scaledX2) / scaledWidth;
            const y1 = height - ((height * scaledY1) / scaledHeight);
            const y2 = height - ((height * scaledY2) / scaledHeight);
            pdfFactory.createHighlightAnnotation(pageNumber, [x1, y1, x2, y2], comment, initial, { r: 255, g: 226, b: 143 });
        }
    }

    return pdfFactory.write();
}