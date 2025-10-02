<script>
import NavbarComponent from './components/NavbarComponent.vue';
import { useGlobalStore } from './stores/global';
import { onBeforeMount } from 'vue';

export default {
   components: {
    NavbarComponent
  },
  setup() {
    const { getUserDetails } = useGlobalStore();

    onBeforeMount(() => getUserDetails(localStorage.getItem("token")));
  }
}
</script>

<template>
  <NavbarComponent />
  <router-view />
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lato&family=Montserrat&display=swap');

html, body, #app {
  font-family: 'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  color: #222;
  margin: 0; padding: 0;
  background-color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  color: #111;
}

.apple-shadow {
  box-shadow:
    0 10px 15px rgba(0, 0, 0, 0.08),
    0 4px 6px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  background-color: #ffffff;
}

.apple-shadow:hover {
  box-shadow:
    0 15px 25px rgba(0, 0, 0, 0.1),
    0 5px 10px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease-in-out;
}

.breadcrumb {
  background-color: #f8f9fa;
  font-size: 0.875rem;
}

.breadcrumb-link {
  text-decoration: none;
  color: #198754; /* Bootstrap green */
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #145c32;
  text-decoration: underline;
}

/* Apple-style subtle shadow */
.apple-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease-in-out;
}

/* Optional Apple-hover effect */
.apple-hover:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

</style>
