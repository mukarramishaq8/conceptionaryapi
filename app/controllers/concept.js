const db = require('../bootstrap');
const httpResponse = require('../helpers/http');
const Concept = db.Concept;
const Perspective = db.Perspective;
const Author = db.Author;

/**
 * send a list of records
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.index = function(req, res, next) {
    Concept.findAll()
    .then(data => res.status(httpResponse.success.c200.code).json({
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
module.exports.getOne = function(req, res, next){
    Concept.findByPk(req.params.conceptId, {include:{model:Perspective, include: {model: Author}}})
    .then(data => {
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
module.exports.create = function(req, res, next){
    let {name, pictureLink} = req.body;
    Concept.create({name, pictureLink})
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
module.exports.update = function(req, res, next){
    let {name, pictureLink} = req.body;
    Concept.findByPk(req.params.conceptId)
    .then(concept => {
        if (!concept) {
            let e = new Error('resource not found');
            e.status = httpResponse.error.client_error.c404.code;
            throw e;
        }
        concept.update({name, pictureLink}).then(data => {
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
module.exports.delete = function(req, res, next){
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
