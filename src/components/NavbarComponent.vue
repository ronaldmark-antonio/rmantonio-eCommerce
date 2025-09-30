<script setup>
import { useGlobalStore } from "../stores/global";
const { user } = useGlobalStore();
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top bg-success shadow-sm">
    <div class="container">
      <!-- Logo + Brand -->
      <router-link :to="{ name: 'Home' }" class="navbar-brand d-flex align-items-center">
        <div class="logo-bg">
          <img src="/images/fusiontechpro-logo.png" alt="FusionTechPro Logo" class="logo-img" />
        </div>
        <span class="ms-2 text-white fw-bold fs-3">FusionTechPro</span>
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNavAltMarkup"
        aria-controls="navbarNavAltMarkup"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav ms-auto align-items-lg-center gap-3">
          <router-link :to="{ name: 'Products' }" class="nav-link fw-semibold text-white">
            <i class="bi bi-box-seam me-1"></i> Products
          </router-link>

          <router-link
            :to="{ name: 'Cart' }"
            class="nav-link fw-semibold text-white"
            v-if="user.email && user.isAdmin === false"
          >
            <i class="bi bi-cart me-1"></i> Cart
          </router-link>

          <router-link
            :to="{ name: 'Orders' }"
            class="nav-link fw-semibold text-white"
            v-if="user.email"
          >
            <i class="bi bi-receipt me-1"></i> Orders
          </router-link>

          <router-link
            :to="{ name: 'Profile' }"
            class="nav-link fw-semibold text-white"
            v-if="user.email"
          >
            <i class="bi bi-person-circle me-1"></i> Profile
          </router-link>

          <router-link
            :to="{ name: 'Register' }"
            class="nav-link fw-semibold text-white"
            v-if="!user.email"
          >
            <i class="bi bi-person-plus me-1"></i> Register
          </router-link>

          <router-link
            :to="{ name: 'Login' }"
            class="nav-link fw-semibold text-white login-highlight"
            v-if="!user.email"
          >
            <i class="bi bi-box-arrow-in-right me-1"></i> Login
          </router-link>

          <router-link
            :to="{ name: 'Logout' }"
            class="nav-link fw-semibold text-white"
            v-else
          >
            <i class="bi bi-box-arrow-right me-1"></i> Logout
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.logo-bg {
  background-color: white;
  border-radius: 3px;
  padding: 2px 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

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
