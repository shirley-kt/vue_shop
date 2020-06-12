import Vue from 'vue'
import App from './App.vue'
import router from './router'

// Global style
import './assets/css/global.css'

// font
import './assets/fonts/iconfont.css'

// Element UI
import './plugins/element.js'

// Axios
import axios from 'axios'

import TreeTable from 'vue-table-with-tree-grid'

// Request base url
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// Add authorization(token)
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
}, error => {
  return Promise.reject(error);
});

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
