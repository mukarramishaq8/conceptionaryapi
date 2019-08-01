const db = require('../bootstrap');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const querystring = require('querystring');
const chalk = require("chalk");
const iconv = require('iconv-lite');
const excelToJson = require('convert-excel-to-json');
const Concept = db.Concept;
const Perspective = db.Perspective;
const Author = db.Author;
const Keyword = db.Keyword;
const Tone = db.Tone;
const { getConceptByName, getAuthorByName, createConcept, createAuthor, ceatePerspective, getPerspective, getAuthorByLastName } = require("../querie-methods");
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
function parseExcelToJson(path) {
    return new Promise((resolve, reject) => {
        let result = excelToJson({
            source: fs.readFileSync(path),
            columnToKey: {
                A: "ID",
                B: "PRONOUN",
                C: "CONCEPT",
                D: "DESCRIPTION",
                E: "AUTHOR_LAST",
                F: "AUTHOR_FIRST",
                G: "CITATION",
                H: "LNG"


            },
            header: {
                rows: 1
            }
        });
        result = result[Object.keys(result)[0]];
        resolve(result);
    })
}
module.exports.upLoadPerspective = function (req, res) {
    upload(req, res, function (err) {
        if (!err) {
            (async () => {
                try {
                    let concept = {};
                    let author = {};
                    let data = [];
                    let newCreated = false;
                    let perspectives = [];
                    let skip = [];
                    perspectives = await parseExcelToJson(req.file.path);
                    for (let i = 0; i < perspectives.length; i++) {
                        if (perspectives[i].CONCEPT) {
                            concept = await getConceptByName(perspectives[i].CONCEPT);
                            if (!concept) {
                                newCreated = true;
                                concept = await createConcept({ name: perspectives[i].CONCEPT })
                            }
                            if (perspectives[i].AUTHOR_LAST) {
                                if (perspectives[i].AUTHOR_LAST && perspectives[i].AUTHOR_FIRST) {
                                    author = await getAuthorByName(perspectives[i].AUTHOR_FIRST + " " + perspectives[i].AUTHOR_LAST);
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
                                } else {
                                    author = await getAuthorByLastName(perspectives[i].AUTHOR_LAST);
                                    console.log(author);
                                    if (!author) {
                                        newCreated = true;
                                        author = await createAuthor(
                                            {
                                                firstName: "",
                                                lastName: perspectives[i].AUTHOR_LAST,
                                                dob: "",
                                                dod: "",
                                                gender: "",
                                                pictureLink: ""
                                            }
                                        );
                                    }
                                }
                            } else {
                                author = await getAuthorByLastName("anonymous");
                                if (!author) {
                                    newCreated = true;
                                    author = await createAuthor(
                                        {
                                            firstName: "",
                                            lastName: "anonymous",
                                            dob: "",
                                            dod: "",
                                            gender: "",
                                            pictureLink: ""
                                        }
                                    );
                                }
                            }
                            let newperspective = await getPerspective({ author_id: author.id, concept_id: concept.id });
                            if (!newperspective || newCreated) {
                                if (!perspectives[i].DESCRIPTION) {
                                    skip.push(i);
                                    continue;
                                }
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
                            } else {
                                skip.push(i);
                            }
                        } else {
                            skip.push(i);
                            continue;
                        }
                    };
                    res.json({ msg: `${data.length} records saved`, skip });
                    //res.json({data});
                } catch (err) {
                    console.log(err);
                }
            })();
        } else {
            res.json({ msg: "file not uploaded", skip });
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
module.exports.createLike = async function (req, res) {
    let perspective = await Perspective.findByPk(req.body.like.id);
    if (perspective) {
        if (perspective.loves == null || perspective.loves === "") {
            perspective.loves = 1;
            perspective = await perspective.save();
        } else {
            if(req.body.like.type==="increase"){
            perspective.loves += 1;
            perspective = await perspective.save();
            }else if(req.body.like.type==="decrease"){
                perspective.loves -= 1;
                perspective = await perspective.save();
            }
        }
        res.json({ perspective });
    } else {
        res.json({ msg: "resource not found" });
    }

    // Users.findAll({
    //     include: {
    //         model: perspectives,
    //         where: {
    //             id: 5
    //         }
    //     }
    // })
    //     .then(user => {
    //         console.log(user[0].Perspectives);
    //         res.send("hello");
    //     })
    //     .catch(err => {
    //         res.send("");
    //         console.log(err);
    //     });
}

module.exports.getPerspectiveDetail = function (req, res) {
    Perspective.findByPk(req.params.perspectiveId, {
        include:[
            { model: Concept },
            { model: Author }
        ]
    }).then(data => {
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data
        });
    }).catch(err=>{
        console.log(err);
    });
}
