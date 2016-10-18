import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Home from '../views/Home.vue'

export default new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    { path: '*', component: Home }
  ]
})
