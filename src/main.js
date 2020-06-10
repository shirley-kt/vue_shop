import Vue from 'vue'
import App from './App.vue'
import router from './router'

// Global style
import './assets/css/global.css'

// font
import './assets/fonts/iconfont.css'
import './assets/icofont/icofont.css'

// Element UI
import './plugins/element.js'

// Axios
import axios from 'axios'

// Request base url
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
