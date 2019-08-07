const db = require('../bootstrap');
const Sequelize = require('sequelize');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const chalk = require('chalk');
const Concept = db.Concept;
const Perspective = db.Perspective;
const ConceptCluster = db.ConceptCluster;
const Author = db.Author;
const Keyword = db.Keyword;
const Tone = db.Tone;
const _ = require('underscore');

/**
 * send a list of records
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.getConceptId = (req, res, next) => {
    if (req.query.name) {
        Concept.findOne({
            where: {
                name: req.query.name
            }
        }).then(data => {
            if (data) {
                obj = {};
                objectMapping = {};
                objectMapping.label = data.name;
                objectMapping.value = data.name;
                objectMapping.id = data.id;
                objectMapping.category = "Concepts";
                // objectMapping.color = authorGroupColor;
                //objectMapping.type = "cluster";
                obj.selectedOption = objectMapping;
                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    obj
                })
            } else {
                obj = {};
                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    obj
                })
            }
        }).catch(err => {
            console.log(err);
        })
    } else {
        res.json({ "msg": "query name not found" });
    }
}
module.exports.index = function (req, res, next) {
    Concept.findAll({
        ...serializers.getPaginators(req.query),
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            {
                model: Perspective, include: [
                    { model: Author },
                    { model: Keyword },
                    { model: Tone },
                ]
            }
        ]
    }).then(data => res.status(httpResponse.success.c200.code).json({
        responseType: httpResponse.responseTypes.success,
        ...httpResponse.success.c200,
        data
    }))
        .catch(next);
};

/**
 * send one matched record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

getAuthorsId = function (filters) {
    return new Promise((resolve, reject) => {

        let outerQuery = "";

        if (filters.length == 1) {
            outerQuery = `SELECT author_id as id FROM authors_author_groups WHERE author_group_id IN (${filters})`;
        }
        else {
            outerQuery = `
            SELECT author_id as id from 
            (SELECT author_id FROM authors_author_groups WHERE author_group_id IN (${filters[0]}) ) as a1
            INNER JOIN
            ( SELECT author_id FROM authors_author_groups WHERE author_group_id IN (${filters[1]}) ) as a2  
            USING(author_id)   
            `;
        }

        db.sequelize.query(outerQuery)
            .then(data => {
                let authorIds = data[0].map(x => x.id);

                resolve(authorIds);
            }).catch(err => console.log(err))

    }).catch(err => console.log(err))
}
module.exports.getPerspectivesByConcept = async function (req, res) {
    let result = await Concept.findByPk(req.params.conceptId, {
        include: [{ model: Perspective,limit: 100 }]
    })
    if (result && result.Perspectives) {
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            perspectives: result.Perspectives
        });
    }
}
module.exports.getOne = async function (req, res, next) {
    let authorIds = [];
    if (req.body.Conceptobj.filters.length > 0) {
        authorIds = await getAuthorsId(req.body.Conceptobj.filters)
    }
    if (authorIds.length > 0) {
        Concept.findByPk(req.body.Conceptobj.concept_id, {

            attributes: serializers.getQueryFields(req.query),
            include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
                {
                    model: Perspective, include: [
                        {
                            model: Author,

                            where: {
                                id: {
                                    [Sequelize.Op.in]: authorIds
                                }
                            }
                        },
                        { model: Keyword },
                        { model: Tone },
                    ]
                }
            ]
        })
            .then(data => {
                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    data
                });
            }).catch(err => {
                console.log(err);
            });
    } else {
        Concept.findByPk(req.body.Conceptobj.concept_id, {
            attributes: serializers.getQueryFields(req.query),
            include: serializers.isRelationshipIncluded(req.query) !== true
                ? undefined
                : serializers.withListAndRelatedOnly(req.query) !== true
                    ? [
                        {
                            model: Perspective, attributes: ['id'], include: [
                                { model: Author },
                                { model: Keyword },
                                { model: Tone }
                            ]
                        }
                    ]
                    : [
                        {
                            model: ConceptCluster, include: [
                                { model: Concept }
                            ]
                        }
                    ]
        })
            .then(data => {
                let Perspectives = {};
                if (data.Perspectives) {
                    Concept.findByPk(req.body.Conceptobj.concept_id, {
                        include: [{ model: Perspective,limit: 100 }]
                    }).then(result => {
                        Perspectives.perspectivesRelations = data;
                        Perspectives.perspectivesDetail = result.Perspectives;
                        res.status(httpResponse.success.c200.code).json({
                            responseType: httpResponse.responseTypes.success,
                            ...httpResponse.success.c200,
                            Perspectives
                        });
                    })
                } else {
                    res.status(httpResponse.success.c200.code).json({
                        responseType: httpResponse.responseTypes.success,
                        ...httpResponse.success.c200,
                        data
                    });
                }
            }).catch(err => {
                console.log(err)
            });

    }

}

/**
 * create a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.create = function (req, res, next) {
    Concept.create(req.body)
        .then(data => {
            res.status(httpResponse.success.c201.code).json({
                responseType: httpResponse.responseTypes.success,
                ...httpResponse.success.c201,
                data
            });
        }).catch(next);
}

/**
 * update a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.update = function (req, res, next) {
    Concept.findByPk(req.params.conceptId)
        .then(concept => {
            if (!concept) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            concept.update(req.body).then(data => {
                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    data
                });
            });
        }).catch(next);
}

/**
 * delete a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.delete = function (req, res, next) {
    Concept.findByPk(req.params.conceptId)
        .then(concept => {
            if (!concept) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            concept.destroy().then(data => {
                res.status(httpResponse.success.c204.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c204
                });
            }).catch(next);
        }).catch(next);
}



let objectMapping = {}

let authorColor = "#A52A2A";
let conceptColor = "#000000";
let conceptClusterColor = "#FF0000";
let authorClusterColor = "#0000FF";
let authorGroupColor = '#33FF57';


module.exports.filter = function (req, res, next) {
    let DataToQuery = [];
    Concept.findAll({
        where: {
            name: {
                [Sequelize.Op.like]: req.params.label + '%'
            }
        },
        limit: 10
    }).then(data => {
        if (data.length > 0) {

            data.forEach(concept => {
                objectMapping = {};
                objectMapping.label = concept.name;
                objectMapping.value = concept.name;
                objectMapping.id = concept.id;
                objectMapping.category = "Concepts";
                objectMapping.color = conceptColor;
                DataToQuery.push(objectMapping);
            });
        }
    }).then(x => {
        DataToQuery.sort((a, b) =>
            a["label"].length - b["label"].length
        );
        DataToQuery = [...new Set(DataToQuery)];
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data: DataToQuery
        })
    });
};

