import express from 'express'
import AdminController from '../../Adapters/Controllers/AdminController'
import jwtAdmin from '../Middlewares/jwt/jwtAdmin'
const AdminRouter=express.Router()



AdminRouter.post('/adminlogin',AdminController.adminLogin)
AdminRouter.get('/getusers',jwtAdmin.verifyJwtAdmin ,AdminController.getUsers)
AdminRouter.post('/blockandunblock',jwtAdmin.verifyJwtAdmin,AdminController.blockAndUnblock)
AdminRouter.get('/venuerequest',jwtAdmin.verifyJwtAdmin,AdminController.venueRequests)
AdminRouter.get('/venuerequest/:venueId',jwtAdmin.verifyJwtAdmin,AdminController.getVenueById)
AdminRouter.post('/venueaccept',jwtAdmin.verifyJwtAdmin,AdminController.venueAccepts)
AdminRouter.post('/venuedecline',jwtAdmin.verifyJwtAdmin,AdminController.venueDecline)
AdminRouter.get('/dashboard',jwtAdmin.verifyJwtAdmin,AdminController.adminDashboard)
AdminRouter.get('/wallet',jwtAdmin.verifyJwtAdmin,AdminController.adminWallet)


export default AdminRouter