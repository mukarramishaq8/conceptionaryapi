const db = require('../bootstrap');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
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
    Perspective.findAll({
        ...serializers.getPaginators(req.query),
        include:[
            {model: Concept},
            {model: Author}
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
module.exports.getOne = function(req, res, next){
    Perspective.findByPk(req.params.perspectiveId, {include:[
        {model: Concept},
        {model: Author}
    ]}).then(data => {
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
module.exports.update = function(req, res, next){
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
module.exports.delete = function(req, res, next){
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
