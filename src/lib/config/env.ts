export const env = {
  development: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
    WS_BASE_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SyncWork',
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  staging: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.staging.syncwork.com/api/v1',
    WS_BASE_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://api.staging.syncwork.com/ws',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://staging.syncwork.com',
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SyncWork',
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  production: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.syncwork.com/api/v1',
    WS_BASE_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://api.syncwork.com/ws',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://app.syncwork.com',
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SyncWork',
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
} as const;

export type Environment = keyof typeof env;

export const getConfig = () => {
  const environment = (process.env.NEXT_PUBLIC_ENVIRONMENT as Environment) || 'development';
  return env[environment];
};
