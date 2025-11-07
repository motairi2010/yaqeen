module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      if (env === 'production') {
        // تعطيل CSS minimizer مؤقتًا لحل مشكلة البناء
        webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.filter(
          minimizer => minimizer.constructor.name !== 'CssMinimizerPlugin'
        );
      }
      return webpackConfig;
    }
  }
};
