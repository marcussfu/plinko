import './assets/main.css'
import './style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import initPlinko from './utils/initPlinko'

const app = createApp(App)
app.directive('init-plinko', initPlinko);
app.use(createPinia())
app.use(router)

app.mount('#app')
