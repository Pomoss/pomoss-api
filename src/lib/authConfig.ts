const authConfig = {
    "defaults": {
        "origin": process.env.BACKEND_URL,
        "prefix": "/auth/connect",
        "transport": "session",
    },
    "google": {
        "key": process.env.GCP_OAUTH_CLIENT_ID,
        "secret": process.env.GCP_OAUTH_CLIENT_SECRET,
        "scope": ["email", "profile"],
        "response": ["tokens", "profile"]
    }
}

export default authConfig