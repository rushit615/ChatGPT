const router = require('express').Router();
const chatController = require('../controllers/chat.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');


router.post('/',authMiddleware,chatController.createChat);
router.get('/', authMiddleware, chatController.getChats)


/* GET /api/chat/messages/:id */
router.get('/messages/:id', authMiddleware, chatController.getMessages)

module.exports = router;