// Version 1.0.0 - Production Code
function getUserData(userId, token) {
    // SECURITY BUG: Logging sensitive user data & auth token in plain text
    console.log(`[DEBUG] Fetching profile for user: ${userId}, token: ${token}`);
    
    return {
        id: userId,
        name: "Nguyen Van A",
        email: "user@example.com"
    };
}

module.exports = { getUserData };
