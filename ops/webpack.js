const path = require('path')

module.exports = { 
    target: 'node',

    externals: ['electron', 'web3', 'sendTx', 'wallet'],

    entry: { 
        entry: './src/entry.js',
    },

    output: {
        path: path.join(__dirname, '../build'),
        filename: 'makerkeeper.js',
        library: 'mk',
        libraryExport: 'default',
        libraryTarget: 'assign',
    },

    resolve: {
        extensions: ['.js', '.json'],
        alias: { 'scrypt.js' : 'scryptsy' },
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env'],
                    },
                },
            },
        ],
    },
}
