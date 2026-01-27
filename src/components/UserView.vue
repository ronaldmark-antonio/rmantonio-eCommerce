<template>
  <div class="row">
    <div class="col my-5 text-center">
      <h1 class="py-1">
        <i class="bi bi-phone text-success"></i> Mobile Phones
      </h1>
      <p class="text-center">
        Upgrade your life! Find your perfect phone today.
      </p>

      <!-- DESKTOP SEARCH -->
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

      <!-- MOBILE SEARCH -->
      <div class="d-md-none mt-3">
        <input
          type="text"
          class="form-control mb-2"
          placeholder="Search products by name or description..."
          v-model="searchInput"
          @keyup.enter="performSearch"
          :disabled="searchLoading || resetLoading"
        />
        <div class="d-flex gap-2">
          <button
            class="btn btn-success flex-fill d-flex align-items-center justify-content-center gap-1"
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
          <button
            class="btn btn-outline-success flex-fill d-flex align-items-center justify-content-center gap-1"
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

  <!-- DESKTOP PRODUCTS -->
  <div class="row g-4 d-none d-md-flex">
    <ProductComponent
      v-for="product in filteredProducts"
      :key="product._id"
      :productData="product"
    />
  </div>

  <!-- MOBILE PRODUCTS -->
  <div class="d-md-none">
    <div
      v-for="product in filteredProducts"
      :key="product._id"
      class="card mb-2"
    >
      <img
        class="card-img-top"
        :src="`https://placehold.co/600x400/ffffff/000000?font=lora&text=${encodeURIComponent(product.name)}`"
        :alt="product.name"
      />
      <div class="card-body p-2">
        <h5 class="mb-1">{{ product.name }}</h5>
        <p class="mb-1 text-truncate">
          {{ product.description
            ? product.description.slice(0, 100) +
              (product.description.length > 100 ? "..." : "")
            : "No description available." }}
        </p>
        <p class="mb-1">Price: ₱{{ product.price?.toLocaleString() }}</p>
        <p class="mb-1">
          Availability:
          <span
            :class="product.isActive ? 'badge bg-success' : 'badge bg-danger'"
          >
            <i
              :class="product.isActive
                ? 'bi bi-check-circle-fill'
                : 'bi bi-x-circle-fill'"
              class="me-1"
            ></i>
            {{ product.isActive ? 'Available' : 'Unavailable' }}
          </span>
        </p>

        <div class="d-flex gap-1 mt-1">
          <!-- Add to Cart Button -->
          <button
            class="btn btn-sm btn-outline-success flex-fill d-flex align-items-center justify-content-center gap-1 p-1"
            :disabled="addingToCart && currentProductId === product._id"
            @click="addToCart(product)"
          >
            <span
              v-if="addingToCart && currentProductId === product._id"
              class="spinner-border spinner-border-sm"
            ></span>
            <template v-else>
              <i class="bi bi-cart-plus"></i>
              <span>Add to Cart</span>
            </template>
          </button>

          <!-- Details Button -->
          <button
            class="btn btn-sm btn-success flex-fill d-flex align-items-center justify-content-center gap-1 p-1"
            :disabled="isLoading && currentProductId === product._id"
            @click="goToDetails(product)"
          >
            <span
              v-if="isLoading && currentProductId === product._id"
              class="spinner-border spinner-border-sm"
            ></span>
            <template v-else>
              <i class="bi bi-info-circle"></i>
              <span>Details</span>
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import ProductComponent from "../components/ProductComponent.vue";
import { useRouter } from "vue-router";
import { useGlobalStore } from "../stores/global";
import { Notyf } from "notyf";
import api from "../api";

const props = defineProps({
  productsData: {
    type: Array,
    default: () => [],
  },
});

const globalStore = useGlobalStore();
const router = useRouter();
const notyf = new Notyf();

const searchInput = ref("");
const searchLoading = ref(false);
const resetLoading = ref(false);

const sortedProducts = computed(() => {
  return [...props.productsData].sort((a, b) => {
    if (a.createdAt && b.createdAt)
      return new Date(b.createdAt) - new Date(a.createdAt);
    return b._id.localeCompare(a._id);
  });
});

const filteredProducts = ref([...sortedProducts.value]);

function performSearch() {
  searchLoading.value = true;
  setTimeout(() => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) filteredProducts.value = [...sortedProducts.value];
    else
      filteredProducts.value = sortedProducts.value.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    searchLoading.value = false;
  }, 300);
}

function resetSearch() {
  resetLoading.value = true;
  setTimeout(() => {
    searchInput.value = "";
    filteredProducts.value = [...sortedProducts.value];
    resetLoading.value = false;
  }, 300);
}

// MOBILE BUTTON LOADING STATES
const addingToCart = ref(false);
const isLoading = ref(false);
const currentProductId = ref(null);

async function addToCart(product) {
  if (addingToCart.value) return;
  addingToCart.value = true;
  currentProductId.value = product._id;

  await nextTick();

  if (!globalStore.user.token) {
    notyf.error("Please login first");
    await new Promise((r) => setTimeout(r, 200));
    addingToCart.value = false;
    currentProductId.value = null;
    return router.push("/login");
  }

  try {
    await api.post(
      "https://rmantonio-ecommerceapi.onrender.com/cart/add-to-cart",
      { productId: product._id, quantity: 1, subtotal: product.price }
    );
    notyf.success("Added to cart");
  } catch {
    notyf.error("Server error: Failed to add to cart");
  } finally {
    addingToCart.value = false;
    currentProductId.value = null;
  }
}

async function goToDetails(product) {
  if (isLoading.value) return;
  isLoading.value = true;
  currentProductId.value = product._id;
  await nextTick();
  router.push(`/products/${product._id}`);
  isLoading.value = false;
  currentProductId.value = null;
}
</script>




