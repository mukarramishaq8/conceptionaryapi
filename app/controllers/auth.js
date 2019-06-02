var JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('../bootstrap');
const User = db.User
module.exports = function(passport) {
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = process.env.SECRET;

    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        console.log("jwt_payload is ", jwt_payload);
        User.findOne({id: jwt_payload.id, username:jwt_payload.username})
        .then((user)=>{
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                    // or you could create a new account
                }
        }).catch(err=>{
            if (err) {
                return done(err, false);
            }
        })
        })
    )};