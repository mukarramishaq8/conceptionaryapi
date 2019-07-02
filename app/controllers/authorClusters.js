const db = require('../bootstrap');
const Sequelize = require('sequelize');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const Concept = db.Concept;
const ConceptCluster = db.ConceptCluster;
const AuthorCluster = db.AuthorCluster;
const AuthorGroup = db.AuthorGroups;
const Perspective = db.Perspective;
const Author = db.Author;
const Keyword = db.Keyword;
const Tone = db.Tone;



let objectMapping = {}

let authorColor = "#A52A2A";
let conceptColor = "#000000";
let authorClusterColor = "#808080";
let authorGroupColor = '#33FF57';

module.exports.filter = function(req, res, next) {
    let DataToQuery = [];
    AuthorGroup.findAll({
        where:{
            name:{
                [Sequelize.Op.like]:'%'+req.params.label+'%'
            }
        },
        limit:10
    }).then(data => {   
        if (data.length > 0) {
            
            data.forEach(cluster => {
                objectMapping = {};
                objectMapping.label = cluster.name + " |Author Group";
                objectMapping.value = cluster.name;
                objectMapping.id = cluster.id;
                objectMapping.category = "Author-Groups";
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

