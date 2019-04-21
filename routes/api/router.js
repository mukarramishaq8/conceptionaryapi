/**
 * this file contains all rest api routes of v1
 */

const express = require('express');
const conceptController = require('./../../app/controllers/concept');
const conceptClusterController = require('./../../app/controllers/conceptCluster');
const perspectiveController = require('./../../app/controllers/perspective');
const authorController = require('./../../app/controllers/author');
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
    .get(conceptController.getOne)
    .put(conceptController.update)
    .delete(conceptController.delete);


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

module.exports = router;
