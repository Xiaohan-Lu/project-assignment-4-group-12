module.exports = {
  apps: [{
    name: "backend",
    script: "./backend/index.js",
    env: {
      NODE_ENV: "production",
      PORT: 5000,
      MONGODB_URI: "mongodb+srv://xlu469:123456@cluster0.vkvdq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      JWT_SECRET: "123",
      EMAIL_USER: "1529868251@qq.com",
      EMAIL_PASSWORD: "bummwtpndcjhibbb",
      ADMIN_EMAIL: "admin@uwo.com",
      ADMIN_PASSWORD: "123456",
      ADMIN_CODE: "123"
    }
  }]
} 