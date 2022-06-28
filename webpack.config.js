const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: ['node', 'es5'],
    mode: 'production',
    externals: [nodeExternals(), /^(main|\$)$/i],
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'core.bundle.js'
    }
};
