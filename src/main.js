import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'notyf/notyf.min.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import RegisterPage from './pages/RegisterPage.vue';
import LoginPage from './pages/LoginPage.vue'
import ProductsPage from './pages/ProductsPage.vue'
import ProductDetails from './pages/ProductDetails.vue';
import LogoutPage from './pages/LogoutPage.vue';


import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
    {
        path: "/register",
        name: "Register",
        component: RegisterPage
    },
    {
        path: "/login",
        name: "Login",
        component: LoginPage
    },
    {
        path: "/products",
        name: "Products",
        component: ProductsPage
    },
    {   
        path: "/products/:productId",
        component: ProductDetails
    },
    {
        path: '/logout',
        name: 'Logout',
        component: LogoutPage
    },
    ]
})

const app = createApp(App)
app.use(router)

app.use(createPinia())

app.mount('#app')
