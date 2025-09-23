<script setup>
import { onBeforeMount, ref, watch } from "vue";
import { useGlobalStore } from "../stores/global";

const { user } = useGlobalStore();

console.log(user.email);
  
const email = ref("")
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top bg-light shadow-sm">
    <div class="container">
      <router-link :to="{ name: 'Home' }" class="navbar-brand text-dark fw-bold">ZUITT</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav ms-auto">
          <router-link :to="{ name: 'Products' }" class="nav-link">Products</router-link>
          <router-link :to="{ name: 'Login' }" class="nav-link">Login</router-link>    
          <router-link :to="{ name: 'Register' }" class="nav-link">Register</router-link>   
        </div>
      </div>
    </div>
 </nav>
</template>