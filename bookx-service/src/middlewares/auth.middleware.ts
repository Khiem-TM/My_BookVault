import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";

// Identity Service URL
const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL || "http://localhost:8080/identity";

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        try {
            // Call Identity Service to introspect
            const response = await axios.post(`${IDENTITY_URL}/auth/introspect`, {
                token: token
            });

            // Identity Service returns: { code: 1000, result: { valid: true } }
            const isValid = response.data?.result?.valid;

            if (isValid) {
                // Token is valid, decode locally to get user claims
                const user = jwt.decode(token);
                (req as any).user = user;
                next();
            } else {
                res.status(403).json({ message: "Token invalid or expired" });
            }
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            res.status(401).json({ message: "Authentication failed" });
        }
    } else {
        res.sendStatus(401);
    }
};
