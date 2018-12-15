module.exports = {
    baseUrl: process.env.NODE_ENV === "production" ? "./" : "/",
    devServer: {
        open: true,
        host: '127.0.0.1',
        port: 9999,
        proxy: {
            '/xboot': {
                // target: 'http://127.0.0.1:8888',  // 请求本地 需要xboot后台项目
                // target: 'http://114.116.93.197:8080',  // 请求本地 需要xboot后台项目
                target: 'http://114.115.161.193:8080',  // 请求本地 需要xboot后台项目
                ws: true
            },
            '/api': {
                // target: 'http://localhost:8080',
                // target: 'http://114.116.93.197:8080',
                target: 'http://114.115.161.193:8080',
                pathRewrite: { "^/api": "" }
            }
        }
    },
    // 打包时不生成.map文件 避免看到源码
    productionSourceMap: false
}