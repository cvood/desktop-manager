import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'wallpaper',
      component: require('@/components/wallpaper').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
