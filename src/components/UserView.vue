<template>
  <div class="row">
    <div class="col my-5 text-center">
      <h1 class="py-1">
        <i class="bi bi-phone text-success"></i> Mobile Phones
      </h1>
      <p class="text-center">
        Upgrade your life! Find your perfect phone today.
      </p>

      <!-- 🔍 DESKTOP-ONLY SEARCH -->
      <div class="d-none d-md-block mt-3">
        <div class="d-flex justify-content-center gap-2">
          <input
            type="text"
            class="form-control w-50"
            placeholder="Search products by name or description..."
            v-model="searchInput"
            @keyup.enter="performSearch"
            :disabled="searchLoading || resetLoading"
          />

          <!-- Search Button -->
          <button
            class="btn btn-success d-flex align-items-center gap-1"
            @click="performSearch"
            :disabled="searchLoading || resetLoading"
          >
            <template v-if="searchLoading">
              <span class="spinner-border spinner-border-sm"></span>
              Searching...
            </template>
            <template v-else>
              <i class="bi bi-search"></i>
              Search
            </template>
          </button>

          <!-- Reset Button -->
          <button
            class="btn btn-outline-success d-flex align-items-center gap-1"
            @click="resetSearch"
            :disabled="resetLoading || searchInput === '' || searchLoading"
          >
            <template v-if="resetLoading">
              <span class="spinner-border spinner-border-sm"></span>
              Resetting...
            </template>
            <template v-else>
              <i class="bi bi-x-circle"></i>
              Reset
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- EMPTY STATE -->
  <div v-if="filteredProducts.length === 0" class="text-center my-5">
    <i class="bi bi-exclamation-circle fs-1 d-block mb-2"></i>
    <p>No products found.</p>
  </div>

  <!-- PRODUCTS -->
  <div v-else class="row g-4">
    <ProductComponent
      v-for="product in filteredProducts"
      :key="product._id"
      :productData="product"
    />
  </div>
</template>

<script setup>
import { defineProps, computed, ref } from "vue";
import ProductComponent from "../components/ProductComponent.vue";

const props = defineProps({
  productsData: {
    type: Array,
    default: () => [],
  },
});

/* 🔥 SORT: NEWEST FIRST */
const sortedProducts = computed(() => {
  return [...props.productsData].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return b._id.localeCompare(a._id);
  });
});

/* 🔍 SEARCH STATE (same as admin) */
const searchInput = ref("");
const filteredProducts = ref([...sortedProducts.value]);
const searchLoading = ref(false);
const resetLoading = ref(false);

/* 🔍 SEARCH */
function performSearch() {
  searchLoading.value = true;

  setTimeout(() => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      filteredProducts.value = [...sortedProducts.value];
    } else {
      filteredProducts.value = sortedProducts.value.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          (product.description &&
            product.description.toLowerCase().includes(query))
      );
    }

    searchLoading.value = false;
  }, 300);
}

/* 🔄 RESET */
function resetSearch() {
  resetLoading.value = true;

  setTimeout(() => {
    searchInput.value = "";
    filteredProducts.value = [...sortedProducts.value];
    resetLoading.value = false;
  }, 300);
}
</script>


