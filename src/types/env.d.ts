declare module 'process' {
    global {
        namespace NodeJS {
            interface ProcessEnv {
                readonly NODE_ENV: 'development' | 'production'

                // For databases
                readonly MYSQL_URL: string
                readonly REDIS_URL: string

                // For Googl OAuth2.0
                readonly GCP_OOGLE_PROJECT_ID: string;
                readonly GCP_OAUTH_CLIENT_ID: string;
                readonly GCP_OAUTH_CLIENT_SECRET: string;

                readonly SERVICE_DOMAIN: string;
                readonly BACKEND_URL: string;
                // Frontend
                readonly FRONTEND_URL: string;
                readonly FRONTEND_LOGIN_URL: string;
                readonly FRONTEND_FAILED_LOGIN_URL: string;

                // JWT
                readonly JWT_SECRET: string;
            }
        }
    }
}