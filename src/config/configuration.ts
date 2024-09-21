export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
});
