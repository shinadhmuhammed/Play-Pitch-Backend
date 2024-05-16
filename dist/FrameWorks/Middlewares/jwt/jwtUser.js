"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const verifyJwtUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const secretKey = process.env.USER_SECRET_KEY;
    if (!secretKey) {
        return res.status(500).json({ message: "Server error: secret key is not defined" });
    }
    let token;
    if ('authorization' in req.headers) {
        token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    }
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secretKey);
            req.id = decoded.id;
            req.role = decoded.role;
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({ message: "Token expired" });
            }
            else {
                res.status(401).json({ message: "Token authentication failed" });
            }
        }
    }
    else {
        res.status(401).json({ message: "Missing or invalid token" });
    }
});
const generateToken = (id, role) => {
    const secretKey = process.env.USER_SECRET_KEY;
    if (!secretKey) {
        throw new Error('User secret key is not defined');
    }
    return jsonwebtoken_1.default.sign({ id, role }, secretKey, { expiresIn: '1h' });
};
const verifyToken = (token) => {
    const secretKey = process.env.USER_SECRET_KEY;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        if (decoded && typeof decoded.id === 'string' && typeof decoded.role === 'string') {
            return decoded;
        }
        else {
            throw new Error('Invalid token format');
        }
    }
    catch (error) {
        return null;
    }
};
exports.default = {
    verifyJwtUser,
    generateToken,
    verifyToken
};
