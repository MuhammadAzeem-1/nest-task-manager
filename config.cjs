module.exports = {
  apps: [
    {
      name: "nest-app",
      script: "dist/main.js",
      env: {
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL,  // required
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
