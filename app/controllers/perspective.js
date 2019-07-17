const db = require('../bootstrap');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const chalk=require("chalk");
const Concept = db.Concept;
const Perspective = db.Perspective;
const Author = db.Author;
const Keyword = db.Keyword;
const Tone = db.Tone;
const { getConceptByName, getAuthorByLabel, createConcept, createAuthor, ceatePerspective, getPerspective } = require("../querie-methods");
const csv = require('csv-parser');
const fs = require('fs');
const upload = require('../config/upload')();
var path = require('path');
/**
 * upload file
 */
//function uploadFile(req,res)
/**
 * send a list of records
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.upLoadPerspective = function (req, res) {
    console.log(req);
    upload(req, res, function (err) {
        if (!err) {
            try {
                let concept = {};
                let author = {};
                let data = [];
                let newCreated = false;
                let perspectives = [];
                fs.createReadStream(`${req.file.path}`).pipe(csv())
                    .on('data', (row) => {
                        perspectives.push(row);
                    })
                    .on('end', async () => {
                        for (let i = 0; i < perspectives.length; i++) {
                            if (perspectives[i].CONCEPT && perspectives[i].AUTHOR_FIRST && perspectives[i].AUTHOR_LAST) {
                                concept = await getConceptByName(perspectives[i].CONCEPT);
                                if (!concept) {
                                    newCreated = true;
                                    concept = await createConcept({ name: perspectives[i].CONCEPT })
                                }
                                author = await getAuthorByLabel(perspectives[i].AUTHOR_FIRST + " " + perspectives[i].AUTHOR_LAST);
                                if (!author) {
                                    newCreated = true;
                                    author = await createAuthor(
                                        {
                                            firstName: perspectives[i].AUTHOR_FIRST,
                                            lastName: perspectives[i].AUTHOR_LAST,
                                            dob: "",
                                            dod: "",
                                            gender: "",
                                            pictureLink: ""
                                        }
                                    );
                                }
                                let newperspective = await getPerspective({ author_id: author.id, concept_id: concept.id });
                                if (!newperspective || newCreated) {
                                    let perspec = await ceatePerspective(
                                        {
                                            pronoun: perspectives[i].PRONOUN,
                                            description: perspectives[i].DESCRIPTION,
                                            longDescription: perspectives[i].LNG,
                                            citation: perspectives[i].CITATION,
                                            author_id: author.id,
                                            concept_id: concept.id
                                        }
                                    )

                                    data.push(perspec);
                                }
                            } else {
                                continue;
                            }
                        }
                        res.json({ msg: `${data.length} records saved` });
                    });
            } catch (err) {
                console.log(chalk.green("*************************"));
                console.log(err);
            }
        } else {
            console.log();
            console.log(err);
            //res.json({msg:"file not uploaded"});
        }
    })
}
module.exports.index = function (req, res, next) {
    Perspective.findAll({
        ...serializers.getPaginators(req.query),
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            { model: Concept },
            { model: Author },
            { model: Keyword },
            { model: Tone },
        ]
    }).then(data => res.status(httpResponse.success.c200.code).json({
        responseType: httpResponse.responseTypes.success,
        ...httpResponse.success.c200,
        data,
        query: req.query
    })).catch(next);
};

/**
 * send one matched record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.getOne = function (req, res, next) {
    Perspective.findByPk(req.params.perspectiveId, {
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            { model: Concept },
            { model: Author },
            { model: Keyword },
            { model: Tone },
        ]
    }).then(data => {
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data
        });
    }).catch(next);
}

/**
 * create a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.create = function (req, res, next) {
    Perspective.create(req.body)
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
    Perspective.findByPk(req.params.perspectiveId)
        .then(perspective => {
            if (!perspective) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            perspective.update(req.body).then(data => {
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
    Perspective.findByPk(req.params.perspectiveId)
        .then(perspective => {
            if (!perspective) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            perspective.destroy().then(data => {
                res.status(httpResponse.success.c204.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c204
                });
            }).catch(next);
        }).catch(next);
}
