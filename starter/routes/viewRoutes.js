const express = require('express');
const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/logout', authController.logout);
router.get('/', viewsController.getHome);
router.get('/base', viewsController.getBase);
router.get('/overview', viewsController.getOverview);
router.get('/login', viewsController.getLoginForm);
router.get('/tour/:slug', viewsController.getTour);

module.exports = router;
