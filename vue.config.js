const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  pwa: {
    iconPaths: {
      favicon32: 'page-icon.ico'
    }
  }
})
