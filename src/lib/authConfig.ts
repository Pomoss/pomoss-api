import env from "./env";

const authConfig = {
    "defaults": {
        "origin": "http://localhost:4000",
        "prefix": "/auth/connect",
        "transport": "session",
    },
    "google": {
        "key": env.GCP_OAUTH_CLIENT_ID,
        "secret": env.GCP_OAUTH_CLIENT_SECRET,
        "scope": ["email", "profile"],
        "response": ["tokens", "profile"]
    }
}

export default authConfig