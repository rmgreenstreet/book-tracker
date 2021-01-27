var express = require('express');
var router = express.Router();
const { 
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  grantAccess
} = require('../controllers/users');
const { isLoggedIn } = require('../middleware');

/* GET users listing. */
router.get('/', isLoggedIn, grantAccess('readAny', 'profile'), getUsers);

/* Get individual user profile */
router.get('/:userId', isLoggedIn, getUser);

/* PUT individual user profile */
router.put('/:userId', isLoggedIn, grantAccess('updateAny', 'profile'), updateUser);

/* DELETE individual user profile */
router.delete('/:userId', isLoggedIn, grantAccess('deleteAny', 'profile'), deleteUser);

module.exports = router;
