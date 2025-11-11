import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import FloatingVue from 'floating-vue'

createApp(App)
    .use(router)
    .use(FloatingVue)
    .mount('#app')
