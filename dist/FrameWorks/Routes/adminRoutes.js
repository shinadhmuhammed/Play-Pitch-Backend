"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AdminController_1 = __importDefault(require("../../Adapters/Controllers/AdminController"));
const jwtAdmin_1 = __importDefault(require("../Middlewares/jwt/jwtAdmin"));
const AdminRouter = express_1.default.Router();
AdminRouter.post('/adminlogin', AdminController_1.default.adminLogin);
AdminRouter.get('/getusers', jwtAdmin_1.default.verifyJwtAdmin, AdminController_1.default.getUsers);
AdminRouter.post('/blockandunblock', jwtAdmin_1.default.verifyJwtAdmin, AdminController_1.default.blockAndUnblock);
AdminRouter.get('/venuerequest', jwtAdmin_1.default.verifyJwtAdmin, AdminController_1.default.venueRequests);
AdminRouter.get('/venuerequest/:venueId', jwtAdmin_1.default.verifyJwtAdmin, AdminController_1.default.getVenueById);
AdminRouter.post('/venueaccept', jwtAdmin_1.default.verifyJwtAdmin, AdminController_1.default.venueAccepts);
AdminRouter.post('/venuedecline', jwtAdmin_1.default.verifyJwtAdmin, AdminController_1.default.venueDecline);
AdminRouter.get('/dashboard', jwtAdmin_1.default.verifyJwtAdmin, AdminController_1.default.adminDashboard);
exports.default = AdminRouter;
