import Vue from 'vue'
import App from './App.vue'
import router from './router'

// Global style
import './assets/css/global.css'

// font
import './assets/fonts/iconfont.css'

// Element UI
import './plugins/element.js'

// import text editor
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

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

Vue.use(VueQuillEditor)

// time filter
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
