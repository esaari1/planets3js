module.exports = {
    module: {
        rules: [
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    'raw-loader',
                    'glslify-loader'
                ]
            },
            {
                test: /\.json$/,
                exclude: /node_modules/,
                use: [
                    'json-loader'
                ],
                type: 'javascript/auto'
            }
        ]
    }
}
