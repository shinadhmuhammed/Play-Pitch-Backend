import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

interface CustomRequest extends Request {
  id?: string;
  role?: string;
}

const verifyOwnerJwt = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const secretKey = process.env.OWNER_SECRET_KEY;

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
      console.log(req.id,req.role,'owners')
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
  const secretKey = process.env.OWNER_SECRET_KEY as string
  return jwt.sign({ id, role }, secretKey, { expiresIn: "9h" });
};

const verifyToken = (token: string): string | null => {
  const secretKey = process.env.OWNER_SECRET_KEY as string
  try {
    const decoded = jwt.verify(token, secretKey) as { otp: string };
    return decoded.otp;
  } catch (error) {
    return null;
  }
};

export default { verifyOwnerJwt, generateTokens, verifyToken };
