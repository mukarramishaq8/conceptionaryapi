const db = require('../bootstrap');
const Sequelize = require('sequelize');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const Concept = db.Concept;
const ConceptCluster = db.ConceptCluster;
const Perspective = db.Perspective;
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
module.exports.getConceptCluster = function (req, res, next) {
    req.query.name
    if(req.query.name){
        ConceptCluster.findOne({
            where:{
               name:req.query.name
            }
        }).then(data => {
            console.log(data);
             obj={};
             objectMapping = {};
                     objectMapping.label = data.name+"| Concept Cluster"
                     objectMapping.value = data.name
                     objectMapping.id = data.id;
                     objectMapping.category = "Concept Clusters";
                     obj.selectedOption=objectMapping;
         res.status(httpResponse.success.c200.code).json({
         responseType: httpResponse.responseTypes.success,
         ...httpResponse.success.c200,
         obj
     })}).catch(err=>{
            console.log(err);
        })
    }else{
        res.json({"msg":"query name not found"});
    }
}
module.exports.index = function (req, res, next) {
    ConceptCluster.findAll({
        ...serializers.getPaginators(req.query),
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            {
                model: Concept,
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
module.exports.getOne = function (req, res, next) {
    ConceptCluster.findByPk(req.params.conceptClusterId, {
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            {
                model: Concept, include: [
                    {
                        model: Perspective, include: [
                            { model: Author },
                            { model: Keyword },
                            { model: Tone },
                        ]
                    }
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
        }).catch(next);
}

/**
 * create a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.create = function (req, res, next) {
    ConceptCluster.create(req.body)
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
    ConceptCluster.findByPk(req.params.conceptId)
        .then(conceptCluster => {
            if (!conceptCluster) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            conceptCluster.update(req.body).then(data => {
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
    ConceptCluster.findByPk(req.params.conceptClusterId)
        .then(conceptCluster => {
            if (!conceptCluster) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            conceptCluster.destroy().then(data => {
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


module.exports.filter = function(req, res, next) {
    let DataToQuery = [];
    ConceptCluster.findAll({
        where:{
            name:{
                [Sequelize.Op.like]:req.params.label+'%'
            }
        },
        limit:10
    }).then(data => {   
        if (data.length > 0) {
            
            data.forEach(cluster => {
                objectMapping = {};
                objectMapping.label = cluster.name + " |Concept Cluster";
                objectMapping.value = cluster.name;
                objectMapping.id = cluster.id;
                objectMapping.category = "Concept Clusters";
                objectMapping.color = conceptClusterColor;

                DataToQuery.push(objectMapping);
            });
        }
    }).then(x=>{
            DataToQuery = [...new Set(DataToQuery)];

            res.status(httpResponse.success.c200.code).json({
                responseType: httpResponse.responseTypes.success,
                ...httpResponse.success.c200,
                data: DataToQuery
            })
        });
};

