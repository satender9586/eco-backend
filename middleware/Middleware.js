import jwt from "jsonwebtoken";

const protectRouteMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ error: 'Authorization token missing' });
        }
        
        const tokenParts = token.split(' ');
        const tokenValue = tokenParts[1]; 
        
        if (!tokenValue) {
            return res.status(401).json({ error: 'Invalid token format' });
        }
        
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export default protectRouteMiddleware;
