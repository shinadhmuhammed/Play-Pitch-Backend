import express from 'express'
import AdminController from '../../Adapters/Controllers/AdminController'
const AdminRouter=express.Router()



AdminRouter.post('/adminlogin',AdminController.adminLogin)
AdminRouter.get('/getusers',AdminController.getUsers)
AdminRouter.post('/blockandunblock',AdminController.blockAndUnblock)
AdminRouter.get('/venuerequest',AdminController.venueRequests)
AdminRouter.post('/venueaccept',AdminController.venueAccepts)

export default AdminRouter