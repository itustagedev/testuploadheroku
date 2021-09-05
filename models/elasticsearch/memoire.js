const client = require('./db');

exports.indexMemoire = async (content) => {
    const memoire = await client.index({
        index: 'memoires',
        refresh: true,
        body: {
            my_join_field: {
                name: "document"
            },
            content: content
        }
    });

    return memoire;
}

exports.indexMemoireTexte = async (esId, text) => {
    const memoire = await client.index({
        index: 'memoires',
        routing: esId,
        refresh: true,
        body: {
            pageTexte: text,
            my_join_field: {
                name: 'textes_par_page',
                parent: esId
            }
        }
    });

    return memoire;
}

exports.deleteMemoire = async (idMemoire) => {
    const memoire = await client.delete({
        index: 'memoires',
        id: idMemoire
    });

    return memoire;
}

exports.getMemoire = async (idMemoire) => {
    const memoire = await client.get({
        index: 'memoires',
        id: idMemoire
    });

    return memoire;
}

exports.findCopyPaste = async (esIdsToExclude, sentence) => {
    const { body } = await client.search({
        index: 'memoires',
        body: {
            query: {
                bool: {
                    must: [
                        {
                            match_phrase: {
                                content: {
                                    query: sentence
                                }
                            }
                        }
                    ],
                    must_not: [
                        {
                            ids: {
                                values: esIdsToExclude
                            }
                        }
                    ]
                }
            }
        }
    });

    return body;
}

exports.findSentencePages = async (esIdMemoire, sentence) => {
    const { body } = await client.search({
        index: 'memoires',
        body: {
            query: {
                bool: {
                    must: [
                        {
                            match_phrase: {
                                'pageTexte.content': sentence
                            }
                        },
                        {
                            has_parent: {
                                parent_type: 'document',
                                query: {
                                    ids: {
                                        values: [esIdMemoire]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        }
    });

    return body;
}

exports.findSentencePagesInAnotherBook = async (esIdsMemoireToExclude, sentence) => {
    const { body } = await client.search({
        index: 'memoires',
        body: {
            query: {
                bool: {
                    must: [
                        {
                            match_phrase: {
                                'pageTexte.content': sentence
                            }
                        }
                    ],
                    must_not: [
                        {
                            has_parent: {
                                parent_type: 'document',
                                query: {
                                    ids: {
                                        values: esIdsMemoireToExclude
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        }
    });

    return body;
}