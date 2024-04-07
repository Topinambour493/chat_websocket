const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    mode: 'production',
    entry: './index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: 'final.js',
    },
    target: 'node',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {from: 'views', to: 'views'},
                {from: 'public', to: 'public'},// Copie le contenu de 'public' dans le dossier de sortie
            ]
        })
    ]
};