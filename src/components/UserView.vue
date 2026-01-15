<template>
  <div class="row">
    <div class="col my-5">
      <h2 class="text-center py-1">
        <i class="bi bi-phone text-success"></i> Mobile Phones
      </h2>
    </div>
  </div>

  <div v-if="productsData.length === 0" class="text-center my-5">
    <i class="bi bi-exclamation-circle fs-1 d-block mb-2"></i>
    <p>No products available at the moment.</p>
  </div>

  <div v-else class="row g-4">
    <ProductComponent v-for="product in productsData" :key="product._id" :productData="product"/>
  </div>
</template>

<script setup>
import ProductComponent from '../components/ProductComponent.vue';
import { defineProps } from 'vue';

const props = defineProps({
    productsData: Array
});

</script>