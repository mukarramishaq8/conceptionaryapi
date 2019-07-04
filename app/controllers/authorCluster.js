const db = require('../bootstrap');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const AuthorGroup = db.AuthorGroup;
const AuthorCluster = db.AuthorCluster;
const Author = db.Author;
const AuthorBioHeading = db.AuthorBioHeading;
const Perspective = db.Perspective;
const Concept = db.Concept;

/**
 * send a list of records
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.getAuthorCluster=function(req,res,next){
    if(req.body.cluster.name){
        if(req.body.cluster.name&&req.body.cluster.groupIds.length>0){
            let DataToQuery = [];
            let groupIds = [];
            let author_cluster_ids = [];
            if (req.body.cluster.groupIds.length == 1) {
                groupIds.push(req.body.cluster.groupIds[0]);
            }
            else {
                groupIds = req.body.cluster.groupIds;
            }
            db.sequelize.query(`SELECT DISTINCT author_cluster_id from author_clusters_author_groups where author_group_id in (${groupIds})`)
                .then(data => {
                    author_cluster_ids = data[0].map(author_cluster => author_cluster.author_cluster_id);
                })
                .then(x => {
                    db.sequelize.query(`SELECT DISTINCT * from author_clusters where id in (${author_cluster_ids}) AND (name LIKE '${req.body.cluster.name}%' OR name LIKE '% ${req.body.cluster.name}%') `)
                        .then(data => {
                            console.log(data);
                                data[0].forEach(author => {
                                    obj={};
                                    objectMapping = {};
                                    objectMapping.label = author.name + "|Author Cluster";
                                    objectMapping.value = author.name;
                                    objectMapping.id = author.id;
                                    objectMapping.category = "Author-Clusters";
                                    obj.selectedOption=objectMapping;
                                    DataToQuery.push(obj);
                                });
                        })
                        .then(x => {
                            DataToQuery = [...new Set(DataToQuery)];
                            res.status(httpResponse.success.c200.code).json({
                                responseType: httpResponse.responseTypes.success,
                                ...httpResponse.success.c200,
                                obj: DataToQuery[0]
                            })
                        })
                        .catch();
                })
                .catch(err => {
                    console.log(err);
                });
        }else{
            AuthorCluster.findOne({
                where:{
                    name:req.body.cluster.name
                }
            }).then(author=>{
            obj={};
            objectMapping = {};
            objectMapping.label = author.name + "|Author Cluster";
            objectMapping.value = author.name;
            objectMapping.id = author.id;
            objectMapping.category = "Author-Clusters";
            obj.selectedOption=objectMapping;
            res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            obj
        })
            })
              .catch(err=>{
                  console.log(err);
              })
        }
    }
}
module.exports.index = function (req, res, next) {
    AuthorCluster.findAll({
        ...serializers.getPaginators(req.query),
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            {
                model: AuthorGroup, attributes: ['id'], include: [
                    {
                        model: Author
                    },
                    AuthorBioHeading,
                ],
            }
        ]
    }).then(data =>
         res.status(httpResponse.success.c200.code).json({
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
    AuthorCluster.findByPk(req.params.authorClusterId, {
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            {
                model: AuthorGroup, attributes: ['id'], include: [
                    {
                        model: Author
                    },
                    AuthorBioHeading,
                ],
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

module.exports.getPerspectivesThroughAuthorCluster = function (req, res, next) {
    let paginator = serializers.getPaginators(req.query);
    paginator.offset = !paginator.offset ? 0 : paginator.offset;
    paginator.limit = !paginator.limit ? 1000 : paginator.limit;
    db.sequelize.query(`select
    c.id conceptId, c.name conceptName, c.picture_link conceptPictureLink,
    p.*,
    a.id authorId, a.first_name authorFirstName, a.last_name authorLastName, a.picture_link authorPictureLink,
    ag.id authorGroupId, ag.name authorGroupName, ag.picture_link authorGroupPictureLink,
    ac.id authorClusterId, ac.name authorClusterName, ac.picture_link authorClusterPictureLink
    from concepts c
    join perspectives p on c.id = p.concept_id
    join authors a on a.id = p.author_id
    join authors_author_groups aag on aag.author_id = a.id
    join author_groups ag on aag.author_group_id = ag.id
    join author_clusters_author_groups agac on agac.author_group_id = ag.id
    join author_clusters ac on agac.author_cluster_id = ac.id
    where ac.id = ${req.params.authorClusterId} ${(paginator.offset || paginator.limit) ? 'limit ' + paginator.offset + ',' + paginator.limit : ''}`, { type: db.sequelize.QueryTypes.SELECT }).then((data) => {
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data: data,
            countData: data.length,
        });
    });
}

/**
 * create a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.create = function (req, res, next) {
    AuthorCluster.create(req.body)
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
    AuthorCluster.findByPk(req.params.authorClusterId)
        .then(authorCluster => {
            if (!authorCluster) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            authorCluster.update(req.body).then(data => {
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
    AuthorCluster.findByPk(req.params.authorClusterId)
        .then(authorCluster => {
            if (!authorCluster) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            authorCluster.destroy().then(data => {
                res.status(httpResponse.success.c204.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c204
                });
            }).catch(next);
        }).catch(next);
}



// module.exports.getPerspectivesThroughAuthorCluster = function (req, res, next) {
//     console.log(req.params.authorClusterId)
//     let paginator = serializers.getPaginators(req.query);
//     paginator.offset = !paginator.offset ? 0 : paginator.offset;
//     paginator.limit = !paginator.limit ? 1000 : paginator.limit;
//     db.sequelize.query(`select
//     c.id conceptId, c.name conceptName, c.picture_link conceptPictureLink,
//     p.*,
//     a.id authorId, a.first_name authorFirstName, a.last_name authorLastName, a.picture_link authorPictureLink,
//     ag.id authorGroupId, ag.name authorGroupName, ag.picture_link authorGroupPictureLink,
//     ac.id authorClusterId, ac.name authorClusterName, ac.picture_link authorClusterPictureLink
//     from concepts c
//     join perspectives p on c.id = p.concept_id
//     join authors a on a.id = p.author_id
//     join authors_author_groups aag on aag.author_id = a.id
//     join author_groups ag on aag.author_group_id = ag.id
//     join author_clusters_author_groups agac on agac.author_group_id = ag.id
//     join author_clusters ac on agac.author_cluster_id = ac.id
//     where ac.id = ${req.params.authorClusterId} ${(paginator.offset || paginator.limit) ? 'limit ' + paginator.offset + ',' + paginator.limit : ''}`, { type: db.sequelize.QueryTypes.SELECT }).then((data) => {
//         res.status(httpResponse.success.c200.code).json({
//             responseType: httpResponse.responseTypes.success,
//             ...httpResponse.success.c200,
//             data: data,
//             countData: data.length,
//         });
//     });
// }
