module.exports = {
  apps: [
    {
      name: "nest-app",
      script: "dist/main.js",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
