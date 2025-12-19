const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        console.log("Authorization header:", authHeader); // Log the full header for debugging

        if (!authHeader) {
            return res.status(401).json({
                message: 'No authorization token provided. Please login to access this resource.'
            });
        }

        // Extract token - handle both "Bearer token" and "Bearer Bearer token" formats
        let token;
        if (authHeader.startsWith('Bearer ')) {
            const parts = authHeader.split(' ');
            // If format is "Bearer Bearer token", take the third part
            if (parts[1] === 'Bearer' && parts[2]) {
                token = parts[2];
            } else {
                // Normal format "Bearer token"
                token = parts[1];
            }
        } else {
            // Token sent without Bearer prefix
            token = authHeader;
        }

        console.log("Extracted token:", token); // Log the extracted token

        if (!token) {
            return res.status(401).json({
                message: 'Invalid token format. Please login again.'
            });
        }

        jwt.verify(token, "my_secret_key_but_it_is_not_secure", (error, decoded) => {
            if (error) {
                console.log("JWT verification error:", error.message);
                return res.status(401).send({
                    isLoggedIn: false,
                    message: 'Failed to authenticate token. Please login again.'
                });
            }
            req.user = {
                id: decoded.id,
                username: decoded.username
            };
            console.log("User authenticated:", req.user.username);
            next(); // Call next to continue to the next middleware/route handler
        });
    } catch (error) {
        console.log("Authentication error:", error.message);
        return res.status(401).json({
            message: 'Authentication failed. Please login again.'
        });
    }
};
