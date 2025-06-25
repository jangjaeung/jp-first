import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import { merge } from 'webpack-merge'
import webpackConfig from './webpack.config.js'

const module = (args, options) =>
    merge(webpackConfig(options), {
        mode: 'development',
        devtool: 'eval-cheap-source-map',
        devServer: {
            client: {
                overlay: false,
            },
            hot: true,
            static: {
                directory: './public', // MSW service worker를 위한 설정
                watch: true,
            },
            port: 8085,
            historyApiFallback: true,
            proxy: [
                {
                    context: ['/api/v1'],
                    target: 'https://vt.ocloud.embracelabs.net/',
                    // target: 'https://dev.ocloud.embracelabs.net/',
                    //target: 'https://ocloud.embracelabs.net/',
                    ws: true,
                    secure: false,
                    changeOrigin: true,
                },
                {
                    context: ['/v3'],
                    target: 'https://vt.ocloud.embracelabs.net/',
                    ws: true,
                    secure: false,
                    changeOrigin: true,
                },
            ],
        },
        plugins: [new ForkTsCheckerWebpackPlugin()],
    })

export default module
