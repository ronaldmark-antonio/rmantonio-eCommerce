<script>
import NavbarComponent from './components/NavbarComponent.vue';
import { onBeforeMount } from 'vue';
import { useGlobalStore } from './stores/global';

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

<style scoped>

</style>