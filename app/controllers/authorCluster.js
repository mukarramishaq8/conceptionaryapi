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
