const jwt = require('jsonwebtoken');

// Key from identity-service application.yaml
const secret = "1TjXchw5FloESb63Kc+DFhTARvpWL4jUGCwfGWxuG5SIf/1y/LgJxHnMqaF6A/ij";

// Payload structure matching typical Identity Service
const token = jwt.sign({ 
    sub: 'test-user-id', // Standard subject claim
    userId: 'test-user-id',
    email: 'test@example.com',
    roles: ['USER', 'ADMIN'],
    scope: 'openid profile email'
}, secret, { expiresIn: '1h' }); // Default algorithm is HS256. If Java uses HS512, I should specify it.
// However, the key string length suggests it might be used as is.
// Let's try default first. If Java uses HS512, we might mismatch. 
// Given the key length (approx 64 chars), 64*8 = 512 bits. So likely HS512.

const tokenHS512 = jwt.sign({ 
    sub: 'test-user-id', 
    userId: 'test-user-id',
    email: 'test@example.com',
    roles: ['USER', 'ADMIN']
}, secret, { algorithm: 'HS512', expiresIn: '1h' });

console.log("HS256 Token:");
console.log(token);
console.log("\nHS512 Token:");
console.log(tokenHS512);
