const db = require('./../bootstrap');
const httpResponse = require('../helpers/http');
const Concept = db.Concept;

/**
 * send a list of records
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.index = function(req, res, next) {
    Concept.findAll()
    .then(data => res.status(httpResponse.success.c200.code).json({
        responseType: "success",
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
    Concept.findByPk(req.params.conceptId)
    .then(data => res.status(httpResponse.success.c200.code).json({
        responseType: "success",
        ...httpResponse.success.c200,
        data
    }))
    .catch(next);
}

/**
 * create a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.create = function(req, res, next){

}

/**
 * update a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.update = function(req, res, next){

}

/**
 * delete a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.delete = function(req, res, next){

}
