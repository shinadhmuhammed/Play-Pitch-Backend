import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request{
    id?:string
}

const JwtUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const secretKey = "Hello@123!"

  let token;

  if ('authorization' in req.headers) {
    token = req.headers['authorization']?.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, secretKey) as { id: string}; 
      req.id = decoded.id;
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


const generateToken=(id:string)=>{
      const secretKey="Hello@123!"
      return jwt.sign({id},secretKey,{expiresIn:'1h'})
}


const verifyToken = (token: string): string | null => {
  const secretKey = "Hello@123!";
  try {
    const decoded = jwt.verify(token, secretKey) as { otp: string };
    return decoded.otp;
  } catch (error) {
    return null;
  }
};



export default{
   JwtUser,generateToken,verifyToken
}
