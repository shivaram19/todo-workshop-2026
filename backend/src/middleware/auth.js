// Authentication Middleware
// This middleware protects routes by verifying JWT tokens

// Import jsonwebtoken library for JWT operations
// JWT (JSON Web Token) is a standard for securely transmitting information between parties
// A JWT contains encoded JSON data and a signature to verify authenticity
import jwt from 'jsonwebtoken';

// Authentication Middleware Function
// This function runs BEFORE protected route handlers to verify user identity
//
// How JWT Authentication Works:
// 1. User logs in with email/password
// 2. Server verifies credentials and creates a JWT containing user ID
// 3. Server sends JWT to client
// 4. Client stores JWT (usually in localStorage)
// 5. Client includes JWT in Authorization header for subsequent requests
// 6. This middleware verifies the JWT and extracts user information
// 7. If valid, request proceeds to route handler; if invalid, returns 401 error
export const authenticateToken = (req, res, next) => {
  // Extract the Authorization header from the request
  // Format expected: "Bearer <token>"
  // Example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const authHeader = req.headers['authorization'];

  // Extract token from "Bearer <token>" format
  // authHeader?.split(' ') splits "Bearer token" into ["Bearer", "token"]
  // [1] gets the second element (the actual token)
  // If authHeader is undefined/null, token will be undefined
  const token = authHeader && authHeader.split(' ')[1];

  // If no token provided, user is not authenticated
  // Return 401 Unauthorized status
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Verify the token using JWT secret
  // jwt.verify does three things:
  // 1. Checks if token signature is valid (ensures token wasn't tampered with)
  // 2. Checks if token hasn't expired (if expiration was set)
  // 3. Decodes the payload (the user data we encoded when creating the token)
  //
  // How JWT Verification Works Under the Hood:
  // - JWT has three parts: header.payload.signature (separated by dots)
  // - Signature is created by: HMACSHA256(base64(header) + "." + base64(payload), secret)
  // - To verify: recreate signature using header + payload + secret
  // - If recreated signature matches provided signature, token is valid
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // If verification fails (invalid signature, expired, malformed)
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Token is valid! Extract user information from decoded payload
    // When we created the token, we encoded { userId: user.id }
    // Now we can access that data via decoded.userId
    req.userId = decoded.userId;

    // Call next() to pass control to the next middleware or route handler
    // The route handler can now access req.userId to know who made the request
    next();
  });
};
