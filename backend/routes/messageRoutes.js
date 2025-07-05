import express from 'express'
import protect from '../middleware/auth.js'
import { getMessages, sendMessage } from '../controll/messageController.js'

const messageRouter = express.Router()

messageRouter.post("/send/:id",protect,sendMessage)
messageRouter.get("/:id",protect,getMessages)


export default messageRouter