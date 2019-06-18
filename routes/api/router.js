/**
 * this file contains all rest api routes of v1
 */

const express = require('express');
const conceptController = require('./../../app/controllers/concept');
const conceptClusterController = require('./../../app/controllers/conceptCluster');
const perspectiveController = require('./../../app/controllers/perspective');
const authorController = require('./../../app/controllers/author');
const authorClustersController = require('./../../app/controllers/authorClusters');
const authorClusterController = require('./../../app/controllers/authorCluster');
const homeController = require('./../../app/controllers/home');
const authorGroupsController = require('./../../app/controllers/authorGroups');
const userController = require('./../../app/controllers/users');
const router = express.Router();

var passport = require('passport');
require('../../app/controllers/auth.js')(passport)

router.use((req, res, next) => {
    console.log('Request Encounter', req.query, req.query.fields);
    next();
});


/*** Concepts related routes. ***/
router.route('/concepts')
    .get(conceptController.index)
    .post(conceptController.create);

router.route('/concepts/:conceptId')
    .get(conceptController.getOne)
    .put(conceptController.update)
    .delete(conceptController.delete);

router.route('/concepts/search/:label')
    .get(conceptController.filter)

/*** ConceptClusters related routes. ***/
router.route('/conceptClusters')
    .get(conceptClusterController.index)
    .post(conceptClusterController.create);

router.route('/conceptClusters/:conceptClusterId')
    .get(conceptClusterController.getOne)
    .put(conceptClusterController.update)
    .delete(conceptClusterController.delete);

router.route('/conceptClusters/search/:label')
    .get(conceptClusterController.filter);



/*** Perspectives related routes. ***/
router.route('/perspectives')
    .get(perspectiveController.index)
    .post(perspectiveController.create);

router.route('/perspectives/:perspectiveId')
    .get(perspectiveController.getOne)
    .put(perspectiveController.update)
    .delete(perspectiveController.delete);


/*** Authors related routes. ***/
router.route('/authors')
    .get(authorController.index)
    .post(authorController.create);

router.route('/authors/:authorId')
    .get(authorController.getOne)
    .put(authorController.update)
    .delete(authorController.delete)

router.route('/authors/search/:label')
    .get(authorController.filter);

router.route('/authors/search')
    .post(authorController.secondFilter);

router.route('/authorGroups/search')
    .post(authorGroupsController.filter);

/*** AuthorCluster related routes. ***/
router.route('/authorClusters/search/:label')
    .get(authorClusterController.filter);
/**Author cluster */
router.route('/authorClusters')
   .get(authorClustersController.index)
   .post(authorClustersController.create);

router.route('/authorClusters/:authorClusterId')
   .get(authorClusterController.getOne)
   .put(authorClusterController.update)
   .delete(authorClusterController.delete);
/*** Home related routes. ***/
router.route('/home/all/:label')
    .get(homeController.index);

/*** Users related routes. ***/
router.route('/users')
    .get(userController.index)
    .post(userController.register);

router.get('/users/test', passport.authenticate('jwt', { session: false }), userController.test)

router.route('/users/:userId')
    .get(userController.getOne)
    .put(userController.update)
    .delete(userController.delete);


router.route('/login')
    .post(userController.login);
router.route('/home/:name')
    .get(homeController.getIdByName);



module.exports = router;
