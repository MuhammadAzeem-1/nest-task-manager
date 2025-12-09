module.exports = {
    apps: [
      {
        name: "nest-app",
        script: "dist/main.js",
        cwd: "/home/ec2-user/nest-task-manager",
        instances: 1,
        exec_mode: "fork",
        env: {
          NODE_ENV: "production",
        },
      }
    ]
  }
  