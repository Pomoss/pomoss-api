import 'dotenv/config'

export interface Env {
  [key: string]: string | number;
  readonly NODE_ENV: 'development' | 'production'
  // For MySQL
  readonly MYSQL_URL: string
  // For MongoDB
  readonly MONGODB_URL: string

  // For Googl OAuth2.0
  readonly GCP_OOGLE_PROJECT_ID: string;
  readonly GCP_OAUTH_CLIENT_ID: string;
  readonly GCP_OAUTH_CLIENT_SECRET: string;

  // Frontend
  readonly FRONTEND_URL: string;
  readonly FRONTEND_LOGIN_URL: string;
  readonly FRONTEND_FAILED_LOGIN_URL: string;

  // JWT
  readonly JWT_SECRET: string;
}

let env:Partial<Env> = process.env


export default env
