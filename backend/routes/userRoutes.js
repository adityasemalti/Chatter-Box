import express from 'express'
import { checkAuth, getOtherUsers, login, logout, register, UpdateProfile } from '../controll/userController.js'
import protect from '../middleware/auth.js'

const userRouter = express.Router()

userRouter.post('/login',login)
userRouter.post('/register',register)
userRouter.post('/logout',logout)
userRouter.post('/update-profile',protect,UpdateProfile)
userRouter.get('/getOtherUsers',protect,getOtherUsers)
userRouter.get('/check',protect,checkAuth)

export default userRouter;