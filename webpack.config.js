module.exports = function (options, _) {
  return {
    ...options,
    watchOptions: {
      poll: process.env.CHOKIDAR_USEPOLLING === 'true' ? 1000 : undefined,
      aggregateTimeout: 300,
      ignored: /node_modules/,
    },
  };
};
