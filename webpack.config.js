const path = require('path');

module.exports = {
    mode:'development',
    entry: './dist2/x.html',
    output: {
        path: path.resolve(__dirname, 'dist3'),
        filename: 'x.js'
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    {
                        loader: path.resolve('./src/webpack/index.js')
                    }
                ]
            }
        ]
    }
};