const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  pwa: {
    iconPaths: {
      favicon32: 'page-icon.ico'
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/research-api': {
        target: 'http://web_research.ankora.com.co',
        changeOrigin: true,
        pathRewrite: {
          '^/research-api': '/api'
        }
      }
    }
  }
})
