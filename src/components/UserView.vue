<template>
  <div class="row">
    <div class="col my-5 text-center">
      <h1 class="py-1">
        <i class="bi bi-phone text-success"></i> Mobile Phones
      </h1>
      <p class="text-center">
        Upgrade your life! Find your perfect phone today.
      </p>
    </div>
  </div>

  <div v-if="sortedProducts.length === 0" class="text-center my-5">
    <i class="bi bi-exclamation-circle fs-1 d-block mb-2"></i>
    <p>No products available at the moment.</p>
  </div>

  <div v-else class="row g-4">
    <ProductComponent
      v-for="product in sortedProducts"
      :key="product._id"
      :productData="product"
    />
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
import ProductComponent from "../components/ProductComponent.vue";

const props = defineProps({
  productsData: {
    type: Array,
    default: () => []
  }
});

/* 🔥 NEWEST FIRST */
const sortedProducts = computed(() => {
  return [...props.productsData].sort((a, b) => {
    // Prefer createdAt if available
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    // Fallback to MongoDB ObjectId
    return b._id.localeCompare(a._id);
  });
});
</script>

