import { createRouter, createWebHistory } from 'vue-router'
import Simulation from '../components/Plinko/PlinkoSimulation.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView,
    // },
    {
      path: '/simulation',
      name: 'simulation',
      component: Simulation,
    },
  ],
})

export default router
