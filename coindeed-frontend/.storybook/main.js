const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\,css&/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: [require('tailwindcss'), require('autoprefixer')],
          },
        },
      ],
      include: path.resolve(__dirname, '../'),
    });
    return config;
  },
};
