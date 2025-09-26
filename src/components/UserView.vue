<template>
  <div class="row">
    <div class="col my-5">
      <h1 class="text-center py-1">
        <i class="bi bi-box-seam me-2"></i> Our Products
      </h1>
    </div>
  </div>
  <div class="row g-4">
    <ProductComponent v-for="product in productsData" :key="product._id" :productData="product" />
  </div>
</template>


<script setup>
import ProductComponent from '../components/ProductComponent.vue';
import { defineProps } from 'vue';

const props = defineProps({
    productsData: Array
});

</script>