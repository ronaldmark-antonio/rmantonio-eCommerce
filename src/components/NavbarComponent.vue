<script setup>
import { ref, onMounted } from "vue";
import { useGlobalStore } from "../stores/global";
import api from "../api";

const { user, setUser } = useGlobalStore(); // assuming you have setUser to update store
const loading = ref(true);

async function fetchUserDetails() {
  try {
    const token = user.token || localStorage.getItem("token");
    if (!token) return;

    const { data } = await api.get("https://rmantonio-ecommerceapi.onrender.com/users/details",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Update global store with fetched details
    setUser({ ...user, ...data.user });
  } catch (err) {
    console.error("Failed to fetch user details:", err);
  } finally {
    loading.value = false;
  }
}

// Fetch user details on mount if not already loaded
onMounted(() => {
  if (!user.firstName) fetchUserDetails();
});
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top bg-success shadow-sm">
    <div class="container">
      <!-- Logo + Brand -->
      <router-link
        :to="user.email ? { name: 'Products' } : { name: 'Home' }"
        class="navbar-brand d-flex align-items-center"
      >
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
        <div class="navbar-nav ms-auto align-items-lg-center gap-lg-3 text-center">

          <!-- Highlighted Welcome badge for mobile only -->
          <div 
            v-if="user.email || user.isAdmin" 
            class="d-flex d-lg-none align-items-center gap-2"
          >
            <span class="login-highlight fw-bold">
              {{ loading ? "Loading..." : `Welcome, ${user.firstName} ${user.lastName}` }}
            </span>
          </div>

          <!-- Admin Dashboard -->
          <router-link
            :to="{ name: 'Products' }"
            class="nav-link fw-semibold text-white"
            v-if="user.isAdmin"
          >
            <i class="bi bi-grid me-1"></i> Dashboard
          </router-link>

          <!-- Shop -->
          <router-link
            :to="{ name: 'Products' }"
            class="nav-link fw-semibold text-white"
            v-else
          >
            <i class="bi bi-bag me-1"></i> Shop
          </router-link>

          <!-- Cart -->
          <router-link
            :to="{ name: 'Cart' }"
            class="nav-link fw-semibold text-white"
            v-if="user.email && !user.isAdmin"
          >
            <i class="bi bi-cart me-1"></i> Cart
          </router-link>

          <!-- Orders -->
          <router-link
            :to="{ name: 'Orders' }"
            class="nav-link fw-semibold text-white"
            v-if="user.email"
          >
            <i class="bi bi-receipt me-1"></i> Orders
          </router-link>

          <!-- Profile showing firstName + lastName -->
          <router-link
            :to="{ name: 'Profile' }"
            class="nav-link fw-semibold text-white"
            v-if="user.email"
          >
            <i class="bi bi-person-circle me-1"></i> Profile
          </router-link>

          <!-- Register & Login -->
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

          <!-- Logout -->
          <router-link
            :to="{ name: 'Logout' }"
            class="nav-link fw-semibold text-white"
            v-else
          >
            <i class="bi bi-box-arrow-right me-1"></i> Logout
          </router-link>

          <!-- Highlighted Welcome badge for desktop only -->
          <div 
            v-if="user.email || user.isAdmin" 
            class="d-none d-lg-flex align-items-center gap-2"
          >
            <span class="login-highlight fw-bold">
              {{ loading ? "Loading..." : `Welcome, ${user.firstName} ${user.lastName}` }}
            </span>
          </div>
          
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

@media (max-width: 991.98px) {
  .login-highlight {
    background-color: transparent !important;
    color: white !important;
    padding: 0;
  }
}

@media (max-width: 991.98px) {
  .navbar-nav {
    gap: 0 !important;
  }

  .nav-link {
    padding: 0.35rem 0;
  }
}


</style>
