import express from 'express'
import AdminController from '../../Adapters/Controllers/AdminController'
import jwtAdmin from '../Middlewares/jwt/jwtAdmin'
const AdminRouter=express.Router()



AdminRouter.post('/adminlogin',AdminController.adminLogin)
AdminRouter.get('/getusers',jwtAdmin.verifyJwtAdmin ,AdminController.getUsers)
AdminRouter.post('/blockandunblock',jwtAdmin.verifyJwtAdmin,AdminController.blockAndUnblock)
AdminRouter.get('/venuerequest',jwtAdmin.verifyJwtAdmin,AdminController.venueRequests)
AdminRouter.post('/venueaccept',jwtAdmin.verifyJwtAdmin,AdminController.venueAccepts)
AdminRouter.post('/venuedecline',jwtAdmin.verifyJwtAdmin,AdminController.venueDecline)

export default AdminRouter