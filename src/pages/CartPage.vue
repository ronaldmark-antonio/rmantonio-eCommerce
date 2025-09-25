<script>
import api from '../api.js';
import { reactive, watch } from 'vue';
import CartComponent from '../components/CartComponent.vue';
import CartView from '../components/CartView.vue';
import { useGlobalStore } from '../stores/global.js';

export default {
 components: {
    CartComponent,
    CartView
  },
  setup() {

  const { user } = useGlobalStore();
  const cart = reactive({data:[]})

  watch([user], async () => {
      if (!user.isLoading) {
        try {
          if (user.email) {
              let response = await api.get('/cart/get-cart');
              cart.data = response.data;
          }
        } catch (err) {
            console.error("Error fetching cart:", err);
        }
      }
    }, { immediate: true });

        return {
          cart,
          user
        }
    }
}
</script>

<template>
  <div class="container">
    <p v-if="user.isLoading">Loading...</p>
    <CartView v-if="!user.isAdmin && !user.isLoading" :cartData="cart.data" />
  </div>
</template>