<script setup>
import {onBeforeMount, ref, watch} from "vue";
import { useGlobalStore } from "../stores/global";
const { user } = useGlobalStore();

console.log(user.email);

const email = ref("")
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top bg-success shadow-sm">
    <div class="container">
      <router-link to="/" class="navbar-brand text-white fw-bold fs-3">
        FusionTechPro
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNavAltMarkup"
        aria-controls="navbarNavAltMarkup"
        aria-expanded="false"
        aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav ms-auto align-items-lg-center gap-3">
          <router-link :to="{ name: 'Products' }" 
            class="nav-link fw-semibold text-white">Products</router-link>
           <router-link :to="{ name: 'Cart' }" 
            class="nav-link fw-semibold text-white"
            v-if="user.email && user.isAdmin === false" >Cart</router-link>
           <router-link :to="{ name: 'Orders' }" 
            class="nav-link fw-semibold text-white" 
            v-if="user.email" >Orders</router-link>
           <router-link :to="{ name: 'Profile' }" 
            class="nav-link fw-semibold text-white" 
            v-if="user.email" >Profile</router-link>
           <router-link :to="{ name: 'Register' }" 
            class="nav-link fw-semibold text-white" 
            v-if="!user.email" >Register</router-link>
          <router-link :to="{ name: 'Login' }" 
            class="nav-link fw-semibold text-white login-highlight" 
            v-if="!user.email">Login</router-link>
           <router-link :to="{ name: 'Logout' }" 
            class="nav-link fw-semibold text-white" 
            v-else>Logout</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.login-highlight {
  background-color: white !important;
  color: #198754 !important;
  border-radius: 0.25rem;
  padding: 0.25rem 0.75rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.login-highlight:hover {
  background-color: #e6f4ea;
  color: #145c32; 
  text-decoration: none;
}

</style>
