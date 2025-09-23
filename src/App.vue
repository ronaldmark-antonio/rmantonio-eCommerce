<script>
  import { onBeforeMount } from 'vue';
  import { useGlobalStore } from './stores/global';

  export default {
    setup() {
      const { getUserDetails } = useGlobalStore();

      onBeforeMount(() => getUserDetails(localStorage.getItem("token")));
    }
  }

</script>

<template>
  <router-view />
</template>

<style scoped>

</style>