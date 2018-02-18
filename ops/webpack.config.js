const path = require('path')

module.exports = { 
    target: 'node',

    externals: ['electron'],

    entry: './src/web3.js',

    output: {
        path: path.join(__dirname, '../build'),
        filename: 'mk.bundle.js'
    },
    
    resolve: {
        extensions: ['.js', '.json'],
        alias: { 'scrypt.js' : 'scryptsy' },
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015'],
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
}
