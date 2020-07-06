module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 3%, not dead',
    }],
  ],
  sourceMaps: 'inline',
  retainLines: true,
};
