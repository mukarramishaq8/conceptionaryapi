const db = require('../bootstrap');
const Sequelize = require('sequelize');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const _ = require('underscore');
const Concept = db.Concept;
const Perspective = db.Perspective;
const Author = db.Author;
const AuthorGroups = db.AuthorGroups;
const AuthorClusters = db.AuthorCluster;



/**
 * send a list of records
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */


 
let objectMapping = {}

let authorColor = "#A52A2A";
let conceptColor = "#000000";
let authorGroupColor = "#4AC4AC";

module.exports.index = function(req, res, next) {
    let DataToQuery = [];
    let fetchedLabesl = req.body.labels;
    let body = req.body;
    AuthorGroups.findAll({
        limit:10
    }).then(data => {   
        if (data.length > 0) {
            
            data.forEach(author => {
                objectMapping = {};
                objectMapping.label = author.name;
                objectMapping.value = author.name;
                objectMapping.id = author.id;
                objectMapping.category = "AuthorGroups";
                objectMapping.color = authorGroupColor;

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


module.exports.getOne = function(req, res, next) {
    // console.log(req.params.authId)
    // let resultData = []
    Author.findAll({
        include:[{
            model:AuthorGroups,
        }],
        where:{
            id:req.body.authorIds
        }
        
    }).then(data => {

        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data
        });
        
    }).catch(next);
};


module.exports.filter = function(req, res, next) {
    let DataToQuery = [];
    // let fetchedLabesl = req.body.labels;
    // let body = req.body;
    if (req.body.tagsObject.type =="both") {
        
    AuthorGroups.findAll({
        where:{
            name:{
                [Sequelize.Op.like]:'%'+req.body.tagsObject.labels+'%'
            }
        },
        limit:5
    }).then(data => {   
        if (data.length > 0) {
            
            data.forEach(author => {
                objectMapping = {};
                objectMapping.label = author.name;
                objectMapping.value = author.name;
                objectMapping.id = author.id;
                objectMapping.category = "AuthorGroups";
                objectMapping.color = authorGroupColor;
                objectMapping.type = "group";

                DataToQuery.push(objectMapping);
            });
        }
    }).then(x=>{
            DataToQuery = [...new Set(DataToQuery)];

            res.status(httpResponse.success.c200.code).json({
                responseType: httpResponse.responseTypes.success,
                ...httpResponse.success.c200,
                data: _.sortBy(DataToQuery,'label')
            })
        });
    }
    else if(req.body.tagsObject.type =="group"){
        let mainQuery = ` SELECT * from author_groups WHERE id IN (
        SELECT DISTINCT author_group_id from authors_author_groups WHERE author_id IN 
        (SELECT author_id from authors_author_groups WHERE author_group_id IN (${req.body.tagsObject.id}))
        )`
        db.sequelize.query(mainQuery).then(data=>{
            if (data.length > 0) {

                let groupsData = data[0]

                groupsData.forEach(group => {
                    objectMapping = {};
                    objectMapping.label = group.name;
                    objectMapping.value = group.name;
                    objectMapping.id = group.id;
                    objectMapping.category = "AuthorGroups";
                    objectMapping.color = authorGroupColor;
                    objectMapping.type = "group";
    
                    DataToQuery.push(objectMapping);
                });
            }
        }).then(x=>{
            DataToQuery = [...new Set(DataToQuery)];

            res.status(httpResponse.success.c200.code).json({
                responseType: httpResponse.responseTypes.success,
                ...httpResponse.success.c200,
                data: _.sortBy(DataToQuery,'label')
            })
        });
    }
    else{
        let mainQuery = `SELECT * from author_clusters where id IN 
        ( SELECT DISTINCT author_cluster_id from author_clusters_author_groups WHERE author_group_id = ${req.body.tagsObject.id})`
        db.sequelize.query(mainQuery).then(data=>{
            if (data.length > 0) {

                let groupsData = data[0]

                groupsData.forEach(group => {
                    objectMapping = {};
                    objectMapping.label = group.name;
                    objectMapping.value = group.name;
                    objectMapping.id = group.id;
                    objectMapping.category = "AuthorGroups";
                    objectMapping.color = authorGroupColor;
                    objectMapping.type = "cluster";
    
                    DataToQuery.push(objectMapping);
                });
            }
        }).then(x=>{
            DataToQuery = [...new Set(DataToQuery)];

            res.status(httpResponse.success.c200.code).json({
                responseType: httpResponse.responseTypes.success,
                ...httpResponse.success.c200,
                data: _.sortBy(DataToQuery,'label')
            })
        });
    }
    
};