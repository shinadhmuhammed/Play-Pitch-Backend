import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

interface CustomRequest extends Request {
    id?: string;
    role?: string;
}

const verifyJwtUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const secretKey = process.env.USER_SECRET_KEY;
    
    if (!secretKey) {
        return res.status(500).json({ message: "Server error: secret key is not defined" });
    }

    let token;

    if ('authorization' in req.headers) {
        token = req.headers['authorization']?.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, secretKey) as { id: string; role: string };
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
  const secretKey = process.env.USER_SECRET_KEY;
  
  
  if (!secretKey) {
      throw new Error('User secret key is not defined');
  }

  return jwt.sign({ id, role }, secretKey as Secret, { expiresIn: '1h' }); 
};

interface DecodedToken {
  id: string;
  role: string;
}


const verifyToken = (token: string): DecodedToken | null => {
  const secretKey = process.env.USER_SECRET_KEY as string; 
  try {
      const decoded = jwt.verify(token, secretKey) as { id: string; role: string } | undefined;
      if (decoded && typeof decoded.id === 'string' && typeof decoded.role === 'string') {
          return decoded;
      } else {
          throw new Error('Invalid token format');
      }
  } catch (error) {
      return null;
  }
};




export default {
    verifyJwtUser,
    generateToken,
    verifyToken
};
