import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import { createHash } from 'crypto'
import Dotenv from 'dotenv-webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import TerserPlugin from 'terser-webpack-plugin'
import { fileURLToPath } from 'url'
import webpack from 'webpack'

const getAbsolutePath = pathDir => path.resolve(process.cwd(), pathDir)

const webpackConfig = options => {
    const isProd = options.env.mode !== 'development'
    const isHot = options.env.WEBPACK_SERVE
    const isModuleCSS = module => {
        return module.type === 'css/mini-extract'
    }
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    return {
        entry: getAbsolutePath('src/index.tsx'),
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.scss', '.css'],
            alias: {
                '@': getAbsolutePath('./src'),
                '@assets': getAbsolutePath('./src/assets'),
                '@fonts': getAbsolutePath('./src/assets/fonts'),
                '@images': getAbsolutePath('./src/assets/images'),
            },
        },
        output: {
            path: getAbsolutePath('dist'),
            filename: 'assets/js/[name].[contenthash].js',
            publicPath: '/',
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    ['@babel/preset-env', { modules: false }],
                                    ['@babel/preset-react', { runtime: 'automatic' }],
                                    '@babel/preset-typescript',
                                ],
                                cacheDirectory: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.(c|sa|sc)ss$/i,
                    use: [
                        isProd ? MiniCssExtractPlugin.loader : 'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    auto: true,
                                },
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                additionalData: "@use '@assets/styles/variables' as *;",
                            },
                        },
                    ],
                },

                {
                    test: /\.(png|jpe?g|gif|ico|vtt|webp)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'img/[contenthash][ext]',
                    },
                },
                {
                    test: /\.svg$/,
                    oneOf: [
                        {
                            resourceQuery: /react/, // `?react` 쿼리 파라미터가 있는 SVG를 컴포넌트로 로드
                            use: ['@svgr/webpack'],
                        },
                        {
                            type: 'asset/resource', // 나머지는 URL로 로드
                        },
                    ],
                    generator: {
                        filename: 'img/[contenthash][ext]',
                    },
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: '[name][ext][query]',
                    },
                },
            ],
        },
        plugins: [
            new Dotenv({
                path: `./.env.${options.env.mode}`,
            }),
            new webpack.DefinePlugin({
                'process.env.isProduction': isProd,
                'process.env.isHot': isHot,
                'process.env.MSW_MODE': options.env.MSW_MODE,
            }),
            new HtmlWebpackPlugin({
                template: getAbsolutePath('public/index.html'),
                favicon: getAbsolutePath('public/favicon.ico'),
                minify: true,
                inject: true,
            }),
            new MiniCssExtractPlugin({
                filename: 'assets/css/[name].[contenthash].css',
                chunkFilename: 'assets/css/[name].[contenthash].chunk.css',
            }),
            new CleanWebpackPlugin({
                verbose: true,
                cleanOnceBeforeBuildPatterns: ['**/*', getAbsolutePath('build/**/*')],
            }),
        ],
        optimization: {
            removeEmptyChunks: true,
            runtimeChunk: 'single',
            minimize: true,
            minimizer: [new TerserPlugin()],
            splitChunks: {
                chunks: 'all',
                minSize: 20000,
                automaticNameDelimiter: '_',
                // core framework, utilities만 vendors로 포함시키고 나머지 종속성은 동적 로드하는 것을 권장
                cacheGroups: {
                    defaultVendors: false,
                    vendor: false,
                    default: false,
                    core: {
                        test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|recoil)[\\/]/,
                        name: 'core',
                        // filename: 'vendor/bundle.[name].js',
                        // filename: 'vendor/core.[contenthash].js',
                        chunks: 'all',
                        priority: 40,
                        enforce: true,
                    },
                    lib: {
                        // 160KB 이상 넘는지 체크
                        test(module) {
                            return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier())
                        },
                        // 160KB 이상 넘는 모듈들의 chunk 이름 지정
                        name(module) {
                            const hash = createHash('sha1')
                            if (isModuleCSS(module)) {
                                module.updateHash(hash)
                                return hash.digest('hex').substring(0, 8)
                            } else {
                                if (!module.libIdent) {
                                    throw new Error(`Encountered unknown module type: ${module.type}. Please open an issue.`)
                                }
                            }

                            hash.update(module.libIdent({ context: __dirname }))
                            return hash.digest('hex').substring(0, 8)
                        },
                        // filename: 'vendor/lib.[contenthash].js',
                        priority: 30,
                        minChunks: 1,
                        reuseExistingChunk: true,
                        maxSize: 255000,
                    },

                    commons: {
                        name: 'commons',
                        // filename: 'vendor/commons.[contenthash].js',
                        minChunks: 20, // define (or pass in) the total number of pages here
                        priority: 20,
                    },
                    shared: {
                        // name(module, chunks) {
                        //     const hash =
                        //         createHash(`sha1`)
                        //             .update(chunks.reduce((acc, chunk) => acc + chunk.name, ``))
                        //             .digest(`hex`) + (isModuleCSS(module) ? '_CSS' : '')
                        //
                        //     return hash
                        // },
                        // filename: 'vendor/shared.[contenthash].js',
                        priority: 10,
                        minChunks: 2,
                        reuseExistingChunk: true,
                    },
                },
            },
        },
    }
}

export default webpackConfig
