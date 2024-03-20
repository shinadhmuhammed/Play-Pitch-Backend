import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

interface CustomRequest extends Request {
    id?: string;
    role?: string;
}

const OwnerJwt = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const secretKey = process.env.OWNER_SECRET_KEY;



 

    let token;

    if ('authorization' in req.headers) {
        token = req.headers['authorization']?.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, secretKey as Secret) as { id: string; role: string }; 
            req.id = decoded.id;
            req.role = decoded.role;
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({ message: "Token expired" });
            } else {
                res.status(401).json({ message: "Token authentication failed" });
            }
        }
    } else {
        res.status(401).json({ message: "Missing or invalid token" });
    }
};

const generateToken = (id: string, role?: string) => {
    const secretKey ='Owner@123';
    return jwt.sign({ id, role }, secretKey, { expiresIn: '1h' });
}


export default { OwnerJwt, generateToken };
