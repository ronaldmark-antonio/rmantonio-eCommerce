<script>
import productsData from '../data/productsData.js';
import api from '../api.js';
import { ref, reactive, onMounted, onBeforeMount, watch } from 'vue';
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

  onMounted(()=>console.log(products));

  watch([user], async () => {
      if (!user.isLoading) {
        try {
          if (user.isAdmin) {
              let response = await api.get('/products/all');
              console.log("Admin products:", response.data);
              products.data = response.data;
          } else {
              let response = await api.get('/products/active');
              console.log("User products:", response.data);
              products.data = response.data;
          }
        } catch (err) {
            console.error("Error fetching products:", err);
        }
      }
    }, { immediate: true });

        return {
          products,
          user
        }
    }
}
</script>

<template>
  <div class="container">
    <p v-if="user.isLoading">Loading...</p>
    <AdminView v-if="user.isAdmin && !user.isLoading" :productsData="products.data" />
    <UserView v-if="!user.isAdmin && !user.isLoading" :productsData="products.data" />
  </div>
</template>