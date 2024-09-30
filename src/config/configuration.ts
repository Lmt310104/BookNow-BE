export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  email_host: process.env.EMAIL_HOST,
  email_port: parseInt(process.env.EMAIL_PORT, 10),
  email_username: process.env.EMAIL_USERNAME,
  email_password: process.env.EMAIL_PASSWORD,
  smtp_user: process.env.SMTP_USER,
});
