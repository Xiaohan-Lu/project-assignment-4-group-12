const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://xlu469:Password@cluster0.vkvdq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  jwt: {
    secret: process.env.JWT_SECRET
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    code: process.env.ADMIN_CODE
  },
  port: process.env.PORT || 5000
};

module.exports = config; 
