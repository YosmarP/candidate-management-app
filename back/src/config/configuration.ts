export const appConfig = () => ({
  database: {
    name: process.env.DATABASE_NAME || 'database.sqlite',
  },
  port: parseInt(process.env.PORT) || 3000,
});