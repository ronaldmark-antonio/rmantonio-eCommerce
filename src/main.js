import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'notyf/notyf.min.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import HomePage from './pages/HomePage.vue';
import RegisterPage from './pages/RegisterPage.vue';
import LoginPage from './pages/LoginPage.vue'
import ProductsPage from './pages/ProductsPage.vue'
import ProductDetails from './pages/ProductDetails.vue';
import EditProduct from './pages/EditProduct.vue';
import LogoutPage from './pages/LogoutPage.vue';
import CartPage from './pages/CartPage.vue';
import OrdersPage from './pages/OrdersPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import AddProduct from './pages/AddProduct.vue';

import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
    {
        path: "/",
        name: "Home",
        component: HomePage
    },
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
        path: "/products/edit/:productId",
        component: EditProduct
    },
    {
        path: '/logout',
        name: 'Logout',
        component: LogoutPage
    },
    {
        path: '/cart',
        name: 'Cart',
        component: CartPage
    },
    {
        path: '/orders',
        name: 'Orders',
        component: OrdersPage
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfilePage
    },
    {   
        path: '/addProduct',
        name: 'Add Product',
        component: AddProduct
    },
    ]
})

const app = createApp(App)
app.use(router)

app.use(createPinia())

app.mount('#app')
