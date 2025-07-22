import express from 'express'
import protect from '../middleware/auth.js'
import { getMessages, getOtherUsers, markMessageAsSeen, sendMessage } from '../controll/messageController.js'

const messageRouter = express.Router()
messageRouter.get('/users',protect,getOtherUsers)
messageRouter.post("/send/:id",protect,sendMessage)
messageRouter.get("/:id",protect,getMessages)
messageRouter.put("/mark/:id",protect,markMessageAsSeen)


export default messageRouter