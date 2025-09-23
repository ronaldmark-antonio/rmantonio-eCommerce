<script setup>
import { computed } from "vue";
import { useGlobalStore } from "../stores/global";

const { user } = useGlobalStore();
const isLoggedIn = computed(() => !!user.email);
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top bg-white shadow-sm">
    <div class="container">
      <router-link to="/" class="navbar-brand text-primary fw-bold fs-3">
        Fusion<span class="text-warning">Tech</span>Pro
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <div class="navbar-nav ms-auto align-items-lg-center gap-3">
          <router-link :to="{ name: 'Products' }" class="nav-link fw-bold text-primary">Products</router-link>
           <router-link :to="{ name: 'Register' }" class="nav-link fw-bold text-primary" v-if="!user.email" >Register</router-link>
          <router-link :to="{ name: 'Login' }" class="nav-link fw-bold text-primary" v-if="!user.email">Login</router-link>
           <router-link :to="{ name: 'Logout' }" class="nav-link" v-else>Logout</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar-brand {
  letter-spacing: 1.5px;
}

.nav-link.active {
  font-weight: 700;
  color: #0d6efd !important;
}

@media (max-width: 991.98px) {
  .navbar-nav {
    margin-top: 1rem;
  }
}
</style>
