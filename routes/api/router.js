/**
 * this file contains all rest api routes of v1
 */

const express = require('express');
const conceptController = require('./../../app/controllers/concept');
const conceptClusterController = require('./../../app/controllers/conceptCluster');
const perspectiveController = require('./../../app/controllers/perspective');
const authorController = require('./../../app/controllers/author');
const authorClusterController = require('./../../app/controllers/authorCluster');
const authorGroupController = require('./../../app/controllers/authorGroup');
const authorBioHeadingController = require('./../../app/controllers/authorBioHeading');
const router = express.Router();

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

/*** ConceptClusters related routes. ***/
router.route('/conceptClusters')
    .get(conceptClusterController.index)
    .post(conceptClusterController.create);

router.route('/conceptClusters/:conceptClusterId')
    .get(conceptClusterController.getOne)
    .put(conceptClusterController.update)
    .delete(conceptClusterController.delete);


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
    .delete(authorController.delete);

/*** AuthorClusters related routes. ***/
router.route('/authorClusters')
    .get(authorClusterController.index)
    .post(authorClusterController.create);

router.route('/authorClusters/:authorClusterId')
    .get(authorClusterController.getOne)
    .put(authorClusterController.update)
    .delete(authorClusterController.delete);

/*** AuthorGroups related routes. ***/
router.route('/authorGroups')
    .get(authorGroupController.index)
    .post(authorGroupController.create);

router.route('/authorGroups/:authorGroupId')
    .get(authorGroupController.getOne)
    .put(authorGroupController.update)
    .delete(authorGroupController.delete);

/*** AuthorBioHeadings related routes. ***/
router.route('/authorBioHeadings')
    .get(authorBioHeadingController.index)
    .post(authorBioHeadingController.create);

router.route('/authorBioHeadings/:authorBioHeadingId')
    .get(authorBioHeadingController.getOne)
    .put(authorBioHeadingController.update)
    .delete(authorBioHeadingController.delete);

module.exports = router;
