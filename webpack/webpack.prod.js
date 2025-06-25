import CompressionWebpackPlugin from 'compression-webpack-plugin'
import { merge } from 'webpack-merge'
import webpackConfig from './webpack.config.js'

const module = (args, options) =>
    merge(webpackConfig(options), {
        mode: 'production',
        devtool: false,
        plugins: [
            new CompressionWebpackPlugin({
                algorithm: 'gzip',
                test: /\.(woff|woff2)$/,
                threshold: 10240,
                minRatio: 0.8,
            }),
        ],
    })

export default module
