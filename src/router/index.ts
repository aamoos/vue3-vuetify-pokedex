import { createRouter, createWebHistory } from 'vue-router'


const Home = () => import('@/views/Home.vue')
const Favorites = () => import('@/views/Favorites.vue')


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: Home },
        { path: '/favorites', name: 'favorites', component: Favorites }
    ],
    scrollBehavior() { return { top: 0 } }
})


export default router