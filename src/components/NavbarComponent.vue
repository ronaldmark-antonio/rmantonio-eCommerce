<script setup>
  import { useGlobalStore } from "../stores/global.js";
  const { user } = useGlobalStore();
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top bg-white shadow-sm">
    <div class="container">
      <RouterLink to="/" class="navbar-brand text-primary fw-bold fs-3">
        Fusion<span class="text-warning">Tech</span>Pro
      </RouterLink>

      <div class="collapse navbar-collapse" id="navbarNav">
        <div class="navbar-nav ms-auto align-items-lg-center gap-3" v-if="user.email">
          <RouterLink to="/products" class="nav-link fw-bold text-primary">Products</RouterLink>
          <RouterLink to="/cart" class="nav-link fw-bold text-primary">Cart</RouterLink>
          <RouterLink to="/orders" class="nav-link fw-bold text-primary">Orders</RouterLink>
          <RouterLink to="/profile" class="nav-link fw-bold text-primary">Profile</RouterLink>
          <RouterLink to="/logout" class="nav-link fw-bold text-primary">Logout</RouterLink>
        </div>
        <div class="navbar-nav ms-auto align-items-lg-center gap-3" v-else>
          <RouterLink to="/register" class="nav-link fw-bold text-primary">Register</RouterLink>
          <RouterLink to="/login" class="nav-link fw-bold text-primary">Login</RouterLink>
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
