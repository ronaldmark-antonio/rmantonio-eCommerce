<script>
import api from '../api.js';
import { reactive, ref, watch } from 'vue';
import ProductComponent from '../components/ProductComponent.vue';

import UserView from '../components/UserView.vue';
import AdminView from '../components/AdminView.vue';
import { useGlobalStore } from '../stores/global.js';

export default {
 components: {
    ProductComponent,
    UserView,
    AdminView
  },
  setup() {

  const { user } = useGlobalStore();
  const products = reactive({data:[]})
  const loading = ref(false);

  watch([user], async () => {
    try {
      loading.value = true;
      if (user.isAdmin) {
          let response = await api.get('https://rmantonio-ecommerceapi.onrender.com/products/all');
          products.data = response.data;
      } else {
          let response = await api.get('https://rmantonio-ecommerceapi.onrender.com/products/active');
          products.data = response.data;
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      loading.value = false
    }
  }, { immediate: true });

      return {
        products,
        user,
        loading
      }
  }
}
</script>

<template>
  <div class="text-center my-5" v-if="loading">
    <div class="spinner-grow"></div>
  </div>
  <div class="container" v-else>
    <AdminView v-if="user.isAdmin && !user.isLoading" :productsData="products.data" />
    <UserView v-if="!user.isAdmin && !user.isLoading" :productsData="products.data" />
  </div>
</template>