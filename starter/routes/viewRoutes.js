const express = require('express');
const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

router.get('/logout', authController.isLoggedIn, authController.logout);
router.get('/', authController.isLoggedIn, viewsController.getHome);
router.get('/base', authController.isLoggedIn, viewsController.getBase);
router.get('/overview', authController.isLoggedIn, viewsController.getOverview);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.isLoggedIn, viewsController.getAccount);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

module.exports = router;
