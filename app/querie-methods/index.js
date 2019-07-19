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
const chalk = require("chalk");
// @ get author ids
module.exports.getAuthorIds = function (Ids) {
    return new Promise(function (resolve, reject) {
        let groupIds = [];
        let query = ``;
        groupIds.push(...Ids);
        if (groupIds.length == 1) {
            query = `SELECT author_id FROM authors_author_groups WHERE author_group_id in (${groupIds})`;
        }
        else {
            query = `
            SELECT author_id from 
            (SELECT author_id FROM authors_author_groups WHERE author_group_id IN (${groupIds[0]}) ) as a1
            INNER JOIN
            ( SELECT author_id FROM authors_author_groups WHERE author_group_id IN (${groupIds[1]}) ) as a2  
            USING(author_id)`;
        }
        db.sequelize.query(query)
            .then(data => {
                let author_ids = data[0].map(x => x.author_id);
                resolve(author_ids);
            })
            .catch(err => {
                console.log(err);
            })
    }).catch(err => {
        console.log(err);
    })
}

/** 
 * search all authors by  name prefix or postfix
 * */ 
module.exports.getAuthorByName=function(label){
   return  Author.findOne({
        where: {
            [Sequelize.Op.or]: [
                Sequelize.where(Sequelize.fn('concat', Sequelize.col('first_name'), ' ', Sequelize.col('last_name')), {
                    [Sequelize.Op.eq]: label
                }),
                Sequelize.where(Sequelize.fn('concat', Sequelize.col('first_name'), ' ', Sequelize.col('last_name')), {
                    [Sequelize.Op.eq]: label
                })
            ]
        }
    })
}
module.exports.searchAllAuthorsByLabel = function (label) {
    return db.sequelize.query(`SELECT * FROM authors WHERE (CONCAT(first_name, ' ', last_name)) LIKE '${label}%' OR (CONCAT(first_name, ' ', last_name)) LIKE '% ${label}%' ORDER BY length(CONCAT(first_name, ' ', last_name)) limit 10`)
}
/**
 * create new author
 */
module.exports.createAuthor=function(author){
   return Author.create(author)
}
/**
 * check for anonymous
 */
module.exports.checkAnonymous=function(){
   //return db.sequelize.query(`select * from authors where last_name=${"anonymous"}`)
   return Author.findOne({
       where:{
           last_name:'anonymous'
       }
   })
}
//@public search all Concepts by  name prefix or postfix
module.exports.searchAllConceptsByLabel = function (label) {
       return Concept.findAll({
            where: {
                [Sequelize.Op.or]: [
                    {
                        name: {
                            [Sequelize.Op.like]: label + '%'
                        }
                    },
                    {
                        name: {
                            [Sequelize.Op.like]: '% ' + label + '%'
                        }
                    }
                ]
            },
            order: [
                [Sequelize.fn('length', Sequelize.col('name'))]
            ],

            limit: 10
        })
}

//@public search all conceptCluster by  name prefix or postfix
module.exports.searchAllConceptClustersByLabel = function (label) {
       return ConceptCluster.findAll({
            where: {
                [Sequelize.Op.or]: [
                    {
                        name: {
                            [Sequelize.Op.like]: label + '%'
                        }
                    },
                    {
                        name: {
                            [Sequelize.Op.like]: '% ' + label + '%'
                        }
                    }
                ]

            },
            order: [Sequelize.fn('length', Sequelize.col('name'))],
            limit: 10
        })
}

/**
 * get concept by exact name
 */
module.exports.getConceptByName=function(name){
    return Concept.findOne({
        where: {
            name:name
        }
    })
}
/**
 * create new concept
 */
module.exports.createConcept=function(concept){
    return Concept.create(concept)
}
//@public search all AuthorCluster by  name prefix or postfix
module.exports.searchAllAuthorClustersByLabel = function (label) {
       return AuthorCluster.findAll({
            where: {
                [Sequelize.Op.or]: [
                    {
                        name: {
                            [Sequelize.Op.like]: label + '%'
                        }
                    },
                    {
                        name: {
                            [Sequelize.Op.like]: '% ' + label + '%'
                        }
                    }
                ]

            },
            order: [Sequelize.fn('length', Sequelize.col('name'))],
            limit: 10
        })
}

// search all AuthorGroups by  name prefix or postfix
module.exports.searchAllAuthorGroupsByLabel = function (label) {
        return AuthorGroups.findAll({
            where: {

                name: {
                    [Sequelize.Op.like]: label + '%'
                }

            },
            order: [Sequelize.fn('length', Sequelize.col('name'))],
            limit: 10
        })
}

/**
 * search Authors by filters 
 */
module.exports.searchAuthorsByFilters=function(filters,label){
   return db.sequelize.query(`SELECT * FROM authors where id IN (${filters}) AND ( CONCAT(first_name,' ',last_name) LIKE '${label}%' OR CONCAT(first_name,' ',last_name) LIKE '% ${label}%') ORDER BY length(CONCAT(first_name, ' ', last_name)) LIMIT 10 `)
}
/**
 * get Author by Filters
 */
module.exports.getAuthorByFilters=function(filters,label){
    return db.sequelize.query(`SELECT * FROM authors where id IN (${filters}) AND ( CONCAT(first_name,' ',last_name) LIKE '${label}%' OR CONCAT(first_name,' ',last_name) LIKE '% ${label}%') ORDER BY length(CONCAT(first_name, ' ', last_name)) LIMIT 10 `)
 }
/**
 * search concepts by filters
 */

 module.exports.searchConceptsByFilters=function(authorIDs,label){
    let innerQuery = "";
    innerQuery = `(SELECT DISTINCT concept_id FROM perspectives WHERE author_id IN (${authorIDs.length > 0 ? authorIDs : -1}))`
    mainQuery = `SELECT DISTINCT * from concepts where id IN ${innerQuery} AND (name LIKE '${label}%' OR name LIKE '% ${label}%') LIMIT 10 `;
    return db.sequelize.query(mainQuery)
 }

 /**
  * Search concept-clusters by filters
  */

module.exports.searchConceptClustersByFilters=function(conceptIDs,label){

    let outerQuery = `(SELECT DISTINCT concept_cluster_id FROM concepts_concept_clusters WHERE concept_id IN (${conceptIDs.length > 0 ? conceptIDs : -1}))`;
    let mainQuery = `SELECT DISTINCT * FROM concept_clusters where id IN (${outerQuery}) AND (name LIKE '${label}%' OR name LIKE '% ${label}%') LIMIT 10 `;
    return db.sequelize.query(mainQuery)
}

/**
 * search Author-Clusters By Filters
 */

 module.exports.searchAuthorClustersByFilters=async function(groupIds,label){
    let author_cluster_ids=[];
    let data= await db.sequelize.query(`SELECT DISTINCT author_cluster_id from author_clusters_author_groups where author_group_id in (${groupIds})`)
    console.log(data[0]);
    author_cluster_ids = data[0].map(author_cluster => author_cluster.author_cluster_id);
    return db.sequelize.query(`SELECT DISTINCT * from author_clusters where id in (${author_cluster_ids}) AND (name LIKE '${label}%' OR name LIKE '% ${label}%') `)
 }

 /**
  * creat perspective
  */

  module.exports.ceatePerspective=async function(perspective){
    return Perspective.create(perspective)
    //return db.sequelize.query(`INSERT INTO perspectives (pronoun,description,long_description,citation,concept_id,author_id) VALUES (${perspective.pronoun},${perspective.description},${perspective.longDescription},${perspective.citation},${perspective.concept_id},${perspective.author_id})`)
  }

  /**
   * get perspective
   */
  module.exports.getPerspective=function(obj){
   return Perspective.findOne({
        where:obj
    });
  }