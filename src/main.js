import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'


import notificationsMixin from '@/mixins/notifications'
// Registrar mixin globalmente posible sustituto de toasttificcation
Vue.mixin(notificationsMixin) //

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
