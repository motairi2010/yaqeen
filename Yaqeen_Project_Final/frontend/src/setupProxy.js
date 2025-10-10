const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function(app) {
  app.use(["/api","/health"], createProxyMiddleware({ target: "http://localhost:4545", changeOrigin: true }));
};
