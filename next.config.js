module.exports = {
  webpack: config => {
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: require.resolve("graphql-tag/loader")
    });
    return config;
  },
  webpackDevMiddleware: config => {
    return config;
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [32, 48, 64, 96, 128],
    domains: [
      "configcdkstack-gpbucketc7c11d3d-qtgzc43jqi2c.s3.us-east-2.amazonaws.com",
      "localhost:3000"
    ]
  }
};
