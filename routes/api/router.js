/**
 * this file contains all rest api routes of v1
 */

const express = require('express');
const routes = require('./routes');
const conceptController = require('./../../app/controllers/concepts');
const router = express.Router();

/* Concepts related routes. */
router.get(routes.concepts.get, conceptController.index);
router.get(routes.concepts.getOne, conceptController.getOne);
router.post(routes.concepts.post, conceptController.create);
router.put(routes.concepts.put, conceptController.update);
router.delete(routes.concepts.delete, conceptController.delete);

module.exports = router;
