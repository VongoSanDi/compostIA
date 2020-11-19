import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import axios from 'axios';
import Slider from '@jeremyhamm/vue-slider'

Vue.config.productionTip = false

Vue.prototype.$http = axios

Vue.use(Slider)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
