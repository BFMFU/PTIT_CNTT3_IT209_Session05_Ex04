// Version 1.0.1 - Production Code (Hotfixed)
function getUserData(userId, token) {
    // FIX: Removed token logging to prevent sensitive data leak in log output
    console.log(`[INFO] Fetching profile for user: ${userId}`);
    
    return {
        id: userId,
        name: "Nguyen Van A",
        email: "user@example.com"
    };
}

module.exports = { getUserData };
