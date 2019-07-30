const db = require('../bootstrap');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const UserLike = db.userLike;
const Users = db.User;
const perspectives = db.Perspective;

/**
 * do user likes
 * 
 */
// {
//     where: {
//         userId: req.body.userLike.user_id,
//         perspectiveId: req.body.userLike.perspective_id
//     }
// }

/**
 * send a list of records
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.index = function (req, res, next) {
    Users.findAll().then(data => res.status(httpResponse.success.c200.code).json({
        responseType: httpResponse.responseTypes.success,
        ...httpResponse.success.c200,
        data
    })).catch(next);
};

/**
 * send one matched record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.getOne = function (req, res, next) {
    Users.findByPk(req.params.userId).then(data => {
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
module.exports.register = function (req, res, next) {
    let user = req.body.User;
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {
            user.password = hash;
            Users.create(user)
                .then(data => {
                    res.status(httpResponse.success.c201.code).json({
                        responseType: httpResponse.responseTypes.success,
                        ...httpResponse.success.c201,
                        data
                    });
                }).catch(next);
        });
    });



}

/**
 * update a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.update = function (req, res, next) {
    Users.findByPk(req.params.userId)
        .then(user => {
            if (!user) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            user.update(req.body).then(data => {
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
    Users.findByPk(req.params.userId)
        .then(user => {
            if (!user) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            user.destroy().then(data => {
                res.status(httpResponse.success.c204.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c204
                });
            }).catch(next);
        }).catch(next);
}


const comparePassword = function (passw, hash, cb) {
    bcrypt.compare(passw, hash, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};


module.exports.login = function (req, res, next) {
    // var admin_required = req.body.admin
    if (!req.body.username || !req.body.password) {
        res.status(400).json({
            success: false,
            msg: 'Please input all fields'
        });
    } else {
        // var organization_name = req.body.organization.toLowerCase();
        var username = req.body.username.toLowerCase();
        var password = req.body.password.toLowerCase();

        Users.findOne({
            where: {
                username: username
                // password: password
            }
        }).then(data => {
            // check if password matches
            comparePassword(req.body.password, data.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var payload = {
                        id: data.id,
                        username: data.username
                    };
                    var token = jwt.sign(payload, process.env.SECRET);
                    // return the information including token as JSON
                    let responseJson = {
                        id: data.id,
                        username: data.username,
                        token: token
                    };
                    res.json({
                        success: true,
                        user: responseJson
                    });
                } else {
                    res.statusMessage = "Invalid Credentials.";
                    return res.status(401).end();
                }
            });
        })

    }
}

module.exports.test = function (req, res, next) {
    return res.json({
        data: "test called"
    })
}