const express = require('express');
const router = express.Router();
const resourcesController = require('../controllers/resourcesController');

router.get('/', resourcesController.getResources);

module.exports = router;
