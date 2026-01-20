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
    0 10px 10px rgba(0, 0, 0, 0.15),
    0 4px 10px rgba(0, 0, 0, 0.15);
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
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
.breadcrumb-item + .breadcrumb-item::before {
  content: "›";
  color: #6c757d;
}

</style>
