import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
    NODE_ENV: get('NODE_ENV').default('development').asString(),
    MONGO_URI: get('MONGO_URI').required().asString(),
    JWT_SECTRET: get('JWT_SECTRET').required().asString(),
    PORT: get('PORT').required().asPortNumber(),
    FRONTEND_URL: get('FRONTEND_URL').required().asString(),
    EXTERNAL_FIXED_TOKEN: get('EXTERNAL_FIXED_TOKEN').required().asString(),
    // URLs adicionales separadas por comas
    ADDITIONAL_FRONTEND_URLS: get('ADDITIONAL_FRONTEND_URLS').default('').asString(),
}