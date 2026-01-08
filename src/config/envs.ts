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
    // Email Configuration (opcional)
    MAILER_HOST: get('MAILER_HOST').default('').asString(),
    MAILER_PORT: get('MAILER_PORT').default(587).asPortNumber(),
    MAILER_SECURE: get('MAILER_SECURE').default('false').asBool(),
    MAILER_EMAIL: get('MAILER_EMAIL').default('').asString(),
    MAILER_SECRET_KEY: get('MAILER_SECRET_KEY').default('').asString(),
    // Respond.io Configuration
    RESPOND_IO_TOKEN: get('RESPOND_IO_TOKEN').default('').asString(),
    RESPOND_IO_CHANNEL_ID: get('RESPOND_IO_CHANNEL_ID').default('').asString(),
    RESPOND_IO_WORKSPACE_ID: get('RESPOND_IO_WORKSPACE_ID').default('').asString(),
    RESPOND_IO_ENABLED: get('RESPOND_IO_ENABLED').default('false').asBool(),
    FOLLOW_UP_AUTOMATION_ENABLED: get('FOLLOW_UP_AUTOMATION_ENABLED').default('false').asBool(),
    FOLLOW_UP_NOTIFY_DEFAULT_EMAIL: get('FOLLOW_UP_NOTIFY_DEFAULT_EMAIL').default('').asString(),
    FOLLOW_UP_NOTIFY_EZEQUIEL_EMAIL: get('FOLLOW_UP_NOTIFY_EZEQUIEL_EMAIL').default('').asString(),
    FOLLOW_UP_NOTIFY_DENIS_EMAIL: get('FOLLOW_UP_NOTIFY_DENIS_EMAIL').default('').asString(),
    FOLLOW_UP_NOTIFY_MARTIN_EMAIL: get('FOLLOW_UP_NOTIFY_MARTIN_EMAIL').default('').asString(),
    FOLLOW_UP_NOTIFY_SIN_ASIGNAR_EMAIL: get('FOLLOW_UP_NOTIFY_SIN_ASIGNAR_EMAIL').default('').asString(),
    // YCloud Configuration
    YCLOUD_API_KEY: get('YCLOUD_API_KEY').default('').asString(),
    YCLOUD_BASE_URL: get('YCLOUD_BASE_URL').default('https://api.ycloud.com/v2').asString(),
    YCLOUD_ENABLED: get('YCLOUD_ENABLED').default('false').asBool(),
    
    // YCloud WhatsApp Numbers Configuration
    YCLOUD_EZEQUIEL_PHONE: get('YCLOUD_EZEQUIEL_PHONE').default('').asString(),
    YCLOUD_DENIS_PHONE: get('YCLOUD_DENIS_PHONE').default('').asString(),
    YCLOUD_MARTIN_PHONE: get('YCLOUD_MARTIN_PHONE').default('').asString(),
};
