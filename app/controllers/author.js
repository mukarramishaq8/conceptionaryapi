const db = require('../bootstrap');
const Sequelize = require('sequelize');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const _ = require('underscore');
const Concept = db.Concept;
const Perspective = db.Perspective;
const Author = db.Author;
const AuthorGroups = db.AuthorGroups;
/**
 * send a list of records
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.index = function (req, res, next) {
    Author.findAll({
        ...serializers.getPaginators(req.query),
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            {
                model: Perspective, include: [
                    { model: Concept }
                ]
            }
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
    Author.findByPk(req.params.authorId, {
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            {
                model: Perspective,
                include: {
                    model: Concept
                }
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
    Author.create(req.body)
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
    Author.findByPk(req.params.authorId)
        .then(author => {
            if (!author) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            author.update(req.body).then(data => {
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
    Author.findByPk(req.params.authorId)
        .then(author => {
            if (!author) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            author.destroy().then(data => {
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
let conceptClusterColor = "#00FF00";


module.exports.filter = function (req, res, next) {
    let DataToQuery = [];
    Author.findAll({
        where: {
            [Sequelize.Op.or]: {
                firstName: {
                    [Sequelize.Op.like]: req.params.label + '%'
                },
                lastName: {
                    [Sequelize.Op.like]: req.params.label + '%'
                }
            }
        },
        limit: 10
    }).then(data => {
        if (data.length > 0) {

            data.forEach(author => {
                objectMapping = {};
                objectMapping.label = author.firstName + " " + author.lastName;
                objectMapping.value = author.firstName + " " + author.lastName;
                objectMapping.id = author.id;
                objectMapping.category = "Author";
                objectMapping.color = authorColor;

                DataToQuery.push(objectMapping);
            });
        }
    }).then(x => {
        DataToQuery = [...new Set(DataToQuery)];

        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data: DataToQuery
        })
    });
};

//  function getAuthorGroupIds  (query){
//     return new Promise(async (resolve, reject)=> {
//         let authorgroupIdsfromClusters = [];
//         let data = await db.sequelize.query(query);
//             if (data.length > 0) {
//                 data[0].forEach(x=> {
//                     authorgroupIdsfromClusters.push(x.id)
//                 })
//             }
//             resolve(authorgroupIdsfromClusters);
//     });
// }


function getAuthorGroupIds(authorgroupIds) {
    return new Promise(async (resolve, reject) => {
        let authorgroupIdsfromClusters = [];

        if (authorgroupIds.length == 1) {
            let data = await db.sequelize.query(`
        SELECT DISTINCT author_group_id as gid from authors_author_groups WHERE author_id IN 
        (SELECT author_id from authors_author_groups WHERE author_group_id IN (${authorgroupIds}))`
            );

            if (data.length > 0) {
                data[0].forEach(x => {
                    authorgroupIdsfromClusters.push(x.gid)
                })
            }

        } else {
            let data = await db.sequelize.query(`
        SELECT DISTINCT author_group_id as gid from authors_author_groups WHERE author_id IN 
        (
            SELECT author_id from
            (SELECT author_id from authors_author_groups WHERE author_group_id = ${authorgroupIds[0]}) as g1
            INNER JOIN
            (SELECT author_id from authors_author_groups WHERE author_group_id = ${authorgroupIds[1]}) as g2
            
            using(author_id)
        )`
            );
            if (data.length > 0) {


                data[0].forEach(x => {
                    authorgroupIdsfromClusters.push(x.gid)
                })
            }
        }

        resolve(authorgroupIdsfromClusters);
    });
}

module.exports.secondFilter = async function (req, res, next) {
    let DataToQuery = [];


    let AuthorIDs = [];
    let ConceptIDs = [];

    // SQUELIZE doesn't provide support/implementation for ALL operator hence using custom raw query
    let outerQuery = "";
    let innerQuery = "";


    let authorgroupIds = [];
    let groupIds = [];
    if (req.body.labels.length == 1) {
        groupIds.push(req.body.labels[0].id);
    }
    else {
        groupIds = req.body.labels.map(x => x.id);
    }

    authorgroupIds = await getAuthorGroupIds(groupIds)


    outerQuery = `(SELECT author_id FROM authors_author_groups WHERE author_group_id IN (${authorgroupIds}) AND author_group_id NOT IN (${groupIds})) `;

    let mainQuery = `SELECT DISTINCT * FROM authors where id IN (${outerQuery}) AND (first_name LIKE '${req.body.label}%' OR last_name LIKE '${req.body.label}%' OR first_name LIKE '% ${req.body.label}%' OR last_name LIKE '% ${req.body.label}%')  LIMIT 10 `;
    db.sequelize.query(mainQuery).then(data => {

        //data is ARRAY of ARRAYS, merging into single array containg author records
        // var merged = [].concat.apply([], data[0]); 
        if (true || merged.length > 0) {

            // let authorsdata = [...merged];
            let authorsdata = data[0];

            //authorsdata = authorsdata.filter(x=> x.firstName.toLowerCase().includes(req.body.label));

            authorsdata.forEach(author => {
                objectMapping = {};
                objectMapping.label = author.first_name + " " + author.last_name;
                objectMapping.value = author.first_name + " " + author.last_name;
                objectMapping.id = author.id;
                objectMapping.category = "Author";
                objectMapping.color = authorColor;

                DataToQuery.push(objectMapping);
                // AuthorIDs.push(author.id);
            });
        }
    }).then(x => {
        let mainQuery = `SELECT DISTINCT * FROM authors where id IN (${outerQuery}) `;
        db.sequelize.query(mainQuery).then(data => {

            //data is ARRAY of ARRAYS, merging into single array containg author records
            // var merged = [].concat.apply([], data[0]); 
            if (true || merged.length > 0) {

                // let authorsdata = [...merged];
                let authorsdata = data[0];

                //authorsdata = authorsdata.filter(x=> x.firstName.toLowerCase().includes(req.body.label));

                authorsdata.forEach(author => {
                    AuthorIDs.push(author.id);
                });
            }
        }).then(x => {

            if (AuthorIDs.length == 1) {
                // console.log(AuthorIDs)
                innerQuery = `(SELECT DISTINCT concept_id from perspectives where author_id = ${AuthorIDs[0]})`;
            }
            else {
                innerQuery = `(SELECT DISTINCT concept_id FROM perspectives WHERE author_id IN (${AuthorIDs}))`
            }
            mainQuery = `SELECT DISTINCT * from concepts where id IN ${innerQuery} AND name LIKE '${req.body.label}%' OR name LIKE '% ${req.body.label}%' LIMIT 10 `;


            db.sequelize.query(mainQuery).then(data => {

                //data is ARRAY of ARRAYS, merging into single array containg author records
                // var merged = [].concat.apply([], data[0]); 
                if (true || merged.length > 0) {

                    // let authorsdata = [...merged];
                    let conceptsData = data[0];

                    conceptsData.forEach(concept => {
                        objectMapping = {};
                        objectMapping.label = concept.name;
                        objectMapping.value = concept.name;
                        objectMapping.id = concept.id;
                        objectMapping.category = "Concept";
                        objectMapping.color = conceptColor;

                        DataToQuery.push(objectMapping);
                        ConceptIDs.push(concept.id);
                    });
                }

            }).then(x => {

                // console.log(ConceptIDs)
                outerQuery = `(SELECT DISTINCT concept_cluster_id FROM concepts_concept_clusters WHERE concept_id IN (${ConceptIDs}))`;

                let mainQuery = `SELECT DISTINCT * FROM concept_clusters where id IN (${outerQuery}) AND name LIKE '${req.body.label}%' OR name LIKE '% ${req.body.label}%' LIMIT 3 `;
                db.sequelize.query(mainQuery).then(data => {

                    //data is ARRAY of ARRAYS, merging into single array containg author records
                    // var merged = [].concat.apply([], data[0]); 
                    if (true || merged.length > 0) {

                        // let authorsdata = [...merged];
                        let conceptsClusterData = data[0];

                        conceptsClusterData.forEach(concept => {
                            objectMapping = {};
                            objectMapping.label = concept.name + " |Concept cluster";
                            objectMapping.value = concept.name;
                            objectMapping.id = concept.id;
                            objectMapping.category = "Concept Clusters";
                            objectMapping.color = conceptClusterColor;

                            DataToQuery.push(objectMapping);
                        });
                    }

                }).then(x => {
                    // DataToQuery = [...new Set(DataToQuery)];
                    DataToQuery = DataToQuery

                        .map(e => e["id"])

                        // store the keys of the unique objects
                        .map((e, i, final) => final.indexOf(e) === i && i)

                        // eliminate the dead keys & store unique objects
                        .filter(e => DataToQuery[e]).map(e => DataToQuery[e]);

                    AuthorIDs = [];
                    ConceptIDs = [];

                    DataToQuery = _.sortBy(DataToQuery, 'label');
                    res.status(httpResponse.success.c200.code).json({
                        responseType: httpResponse.responseTypes.success,
                        ...httpResponse.success.c200,
                        data: DataToQuery.slice(0, 10)
                    })
                })
            })
        })
    })
}
