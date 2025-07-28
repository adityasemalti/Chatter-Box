import express from 'express'
import { checkAuth, login, signup, UpdateProfile } from '../controll/userController.js'
import protect from '../middleware/auth.js'

const userRouter = express.Router()

userRouter.post('/login',login)
userRouter.post('/signup',signup)
userRouter.put('/update-profile',protect,UpdateProfile)
userRouter.get('/check',protect,checkAuth)

export default userRouter;