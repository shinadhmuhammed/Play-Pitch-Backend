import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

interface CustomRequest extends Request {
  id?: string;
  role?: string;
}

const OwnerJwt = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const secretKey = "Owner@123";

  if (!secretKey) {
    return res
      .status(500)
      .json({ message: "Server error: secret key is not defined" });
  }


  let token;

  if ("authorization" in req.headers) {
    token = req.headers["authorization"]?.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, secretKey) as {
        id: string;
        role: string;
      };
      req.id = decoded.id;
      req.role = decoded.role;
      console.log(req.id,req.role,'id machu,role machu')
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: "Token expired" });
      } else {
        res.status(401).json({ message: "Token authentication failed" });
      }
      console.error("JWT Error:", error); 
    }
  } else {
    res.status(401).json({ message: "Missing or invalid token" });
  }
};

const generateTokens = (id: string, role?: string) => {
  const secretKey = "Owner@123";
  return jwt.sign({ id, role }, secretKey, { expiresIn: "9h" });
};

const verifyToken = (token: string): string | null => {
  const secretKey = "Owner@123";
  try {
    const decoded = jwt.verify(token, secretKey) as { otp: string };
    return decoded.otp;
  } catch (error) {
    return null;
  }
};

export default { OwnerJwt, generateTokens, verifyToken };
