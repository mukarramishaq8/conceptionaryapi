const db = require('../bootstrap');
const Sequelize = require('sequelize');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const _ = require('underscore');
const Concept = db.Concept;
const Perspective = db.Perspective;
const Author = db.Author;
const AuthorGroups = db.AuthorGroups;
const ConceptCluster = db.ConceptCluster;
const AuthorCluster = db.AuthorCluster;


let objectMapping = {}

let authorColor = "#A52A2A";
let conceptColor = "#000000";
let conceptClusterColor = "#FF0000";


module.exports.index = function(req, res, next) {
    let DataToQuery = []
    Author.findAll({
        where:{
            [Sequelize.Op.or]:{
                firstName:{
                    [Sequelize.Op.like]:req.params.label+'%'
                },
                lastName:{
                    [Sequelize.Op.like]:req.params.label+'%'
                }
            }
        },
        limit:3
    }).
        then(data => {
            
            data.forEach(author => {
                objectMapping = {};
                objectMapping.label = author.firstName + " " + author.lastName;
                objectMapping.value = author.firstName + " " + author.lastName;
                objectMapping.id = author.id;
                objectMapping.category = "Author";
                objectMapping.color = authorColor;

                DataToQuery.push(objectMapping);
            });
            
    }).then(x=>{
        
            Concept.findAll({
                where:{
                    name:{
                        [Sequelize.Op.like]:'%'+req.params.label+'%'
                    }
                },
                limit:3
            }).
            then(data=> {
                data.forEach(concept => {
                    objectMapping = {};
                    objectMapping.label = concept.name ;
                    objectMapping.value = concept.name;
                    objectMapping.id = concept.id;
                    objectMapping.category = "Concept";
                    objectMapping.color = conceptColor;

                    DataToQuery.push(objectMapping);
                });
                

                
        })
    }).then(x=>{
        

            ConceptCluster.findAll({
                where:{
                    name:{
                        [Sequelize.Op.like]:'%'+req.params.label+'%'
                    }
                },
                limit:3
            }).
            then(data=> {
                data.forEach(concept => {
                    objectMapping = {};
                    objectMapping.label = concept.name ;
                    objectMapping.value = concept.name;
                    objectMapping.id = concept.id;
                    objectMapping.category = "Concept Clusters";
                    objectMapping.color = conceptClusterColor;

                    DataToQuery.push(objectMapping);
                });
                

                
        }).then(x=>{
            
            DataToQuery = [...new Set(DataToQuery)];

            res.status(httpResponse.success.c200.code).json({
                responseType: httpResponse.responseTypes.success,
                ...httpResponse.success.c200,
                data: _.sortBy(DataToQuery,'label')
            })
        });
    })
        
};