<script setup>
import { defineProps, computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import api from "../api";

const router = useRouter();
const notyf = new Notyf();

const props = defineProps({
  productsData: {
    type: Array,
    default: () => [],
  },
});

const loading = reactive({
  add: false,
  orders: false,
});

// Product-specific loading helper
function ensureProductLoading(product) {
  if (!loading[product._id]) {
    loading[product._id] = { update: false, action: false };
  }
  return loading[product._id];
}

// Update product
function updateProduct(product) {
  const prodLoad = ensureProductLoading(product);
  prodLoad.update = true;
  setTimeout(() => {
    router.push(`/products/edit/${product._id}`);
    prodLoad.update = false;
  }, 300);
}

// Archive / Disable product
async function archiveProduct(product) {
  const prodLoad = ensureProductLoading(product);
  prodLoad.action = true;
  try {
    const res = await api.patch(
      `https://rmantonio-ecommerceapi.onrender.com/products/${product._id}/archive`
    );
    if (res.status === 200) {
      product.isActive = false;
      notyf.success("Product archived successfully");
    }
  } catch {
    notyf.error("Server error: Could not archive product");
  } finally {
    prodLoad.action = false;
  }
}

// Activate product
async function activateProduct(product) {
  const prodLoad = ensureProductLoading(product);
  prodLoad.action = true;
  try {
    const res = await api.patch(
      `https://rmantonio-ecommerceapi.onrender.com/products/${product._id}/activate`
    );
    if (res.status === 200) {
      product.isActive = true;
      notyf.success("Product activated successfully");
    }
  } catch {
    notyf.error("Server error: Could not activate product");
  } finally {
    prodLoad.action = false;
  }
}

// Sorted products by date or ID
const sortedProducts = computed(() => {
  return [...props.productsData].sort((a, b) => {
    if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
    return b._id.localeCompare(a._id);
  });
});

function goToAddProduct() {
  if (loading.add) return;
  loading.add = true;
  setTimeout(() => {
    router.push("/addProduct");
  }, 200);
}

function goToOrders() {
  if (loading.orders) return;
  loading.orders = true;
  setTimeout(() => {
    router.push("/orders");
  }, 200);
}

const searchInput = ref("");            
const filteredProducts = ref([...sortedProducts.value]); 
const searchLoading = ref(false);      

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
          product.description.toLowerCase().includes(query)
      );
    }
    searchLoading.value = false;
  }, 300);
}

const resetLoading = ref(false);

function resetSearch() {
  resetLoading.value = true;

  setTimeout(() => {
    searchInput.value = "";
    filteredProducts.value = [...sortedProducts.value];
    resetLoading.value = false;
  }, 300);
}


</script>

<template>
  <div class="dashboard-container apple-shadow p-4 my-5">

    <h1 class="text-center">
      <i class="bi bi-person-gear text-success me-2"></i>
      Product Dashboard
    </h1>

    <p class="text-center mb-3">
      Welcome back Admin! Manage your store with ease.
    </p>

    <!-- HEADER BUTTONS -->
    <div class="text-center mb-4">
      <!-- Add Product Button -->
      <button
        class="btn btn-success mx-2"
        :disabled="loading.add"
        @click="goToAddProduct"
      >
        <span v-if="loading.add" class="spinner-border spinner-border-sm me-1"></span>
        <span v-if="loading.add">Loading...</span>
        <template v-else>
          <i class="bi bi-plus-circle me-1"></i>
          Add Product
        </template>
      </button>

      <!-- Orders Button -->
      <button
        class="btn btn-outline-success mx-2"
        :disabled="loading.orders"
        @click="goToOrders"
      >
        <span v-if="loading.orders" class="spinner-border spinner-border-sm me-1"></span>
        <span v-if="loading.orders">Loading Orders...</span>
        <template v-else>
          <i class="bi bi-cart-check me-1"></i>
          Orders
        </template>
      </button>
    </div>

    <!-- EMPTY STATE -->
    <div v-if="sortedProducts.length === 0" class="text-center my-5">
      <h3>Your Product Catalog is Empty</h3>
      <p>Click "Add Product" to begin building your store!</p>
    </div>

    <!-- PRODUCTS LIST -->
    <div v-else>
      <!-- DESKTOP TABLE -->
      <div class="table-responsive d-none d-md-block">
        <!-- SEARCH INPUT -->
        <div class="mb-3 text-center d-flex justify-content-center gap-2">
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
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Searching...</span>
            </template>
            <template v-else>
              <i class="bi bi-search me-1"></i>
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
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Resetting...</span>
            </template>
            <template v-else>
              <i class="bi bi-x-circle me-1"></i>
              Reset
            </template>
          </button>
        </div>

        <table class="table table-bordered table-hover align-middle text-center">
          <thead class="table-light">
            <tr>
              <th class="text-start" style="width: 350px;">Name</th>
              <th class="text-start" style="width: 400px;">Description</th>
              <th style="width: 80px;">Price</th>
              <th style="width: 80px;">Availability</th>
              <th colspan="2" style="width: 90px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product._id">
              <td class="text-start" style="width: 90px;">{{ product.name }}</td>
              <td class="text-start" style="width: 150px;">{{ product.description }}</td>
              <td style="width: 100px;">₱{{ product.price?.toLocaleString() }}</td>
              <td style="width: 120px;">
                <span :class="product.isActive ? 'badge bg-success' : 'badge bg-danger'">
                  <i :class="product.isActive ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'" class="me-1"></i>
                  {{ product.isActive ? 'Available' : 'Unavailable' }}
                </span>
              </td>

              <!-- Update Button -->
              <td style="width: 100px">
                <button
                  class="btn btn-sm btn-outline-dark d-flex align-items-center justify-content-center gap-1"
                  style="width: 100px;"
                  :disabled="ensureProductLoading(product).update"
                  @click="updateProduct(product)"
                >
                  <!-- Spinner when loading -->
                  <span v-if="ensureProductLoading(product).update" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>

                  <!-- Icon + text when NOT loading -->
                  <template v-if="!ensureProductLoading(product).update">
                    <i class="bi bi-pencil-square"></i>
                    <span>Update</span>
                  </template>

                  <!-- Text while loading -->
                  <template v-else>
                    <span>Loading...</span>
                  </template>
                </button>
              </td>

              <!-- Activate / Disable Button -->
              <td>
                <button
                  class="btn btn-sm d-flex align-items-center justify-content-center gap-1"
                  style="width: 100px;"
                  :class="product.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                  :disabled="ensureProductLoading(product).action"
                  @click="product.isActive ? archiveProduct(product) : activateProduct(product)"
                >
                  <!-- Spinner while loading -->
                  <span v-if="ensureProductLoading(product).action" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>

                  <!-- Icon + text when NOT loading -->
                  <template v-if="!ensureProductLoading(product).action">
                    <i :class="product.isActive ? 'bi bi-x-circle' : 'bi bi-check-circle'"></i>
                    <span>{{ product.isActive ? 'Disable' : 'Activate' }}</span>
                  </template>

                  <!-- Text while loading -->
                  <template v-else>
                    <span>{{ product.isActive ? 'Disabling...' : 'Activating...' }}</span>
                  </template>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE CARDS -->
      <div class="d-md-none">
        <!-- MOBILE SEARCH -->
        <div class="d-md-none mb-3">
          <input
            type="text"
            class="form-control mb-2"
            placeholder="Search products by name or description..."
            v-model="searchInput"
            @keyup.enter="performSearch"
            :disabled="searchLoading || resetLoading"
          />

          <div class="d-flex gap-2">
            <!-- Search Button -->
            <button
              class="btn btn-success flex-fill d-flex align-items-center justify-content-center gap-1"
              @click="performSearch"
              :disabled="searchLoading || resetLoading"
            >
              <template v-if="searchLoading">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Searching...</span>
              </template>
              <template v-else>
                <i class="bi bi-search me-1"></i>
                Search
              </template>
            </button>

            <!-- Reset Button -->
            <button
              class="btn btn-outline-success flex-fill d-flex align-items-center justify-content-center gap-1"
              @click="resetSearch"
              :disabled="resetLoading || searchInput === '' || searchLoading"
            >
              <template v-if="resetLoading">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Resetting...</span>
              </template>
              <template v-else>
                <i class="bi bi-x-circle me-1"></i>
                Reset
              </template>
            </button>
          </div>
        </div>

        <div v-for="product in filteredProducts" :key="product._id" class="card mb-2">
          <div class="card-body p-2">
            <h5 class="mb-1">{{ product.name }}</h5>
            <p class="mb-1 text-truncate">Description: {{ product.description }}</p>
            <p class="mb-1">Price: ₱{{ product.price?.toLocaleString() }}</p>
            <p class="mb-1">
              Availability:
              <span :class="product.isActive ? 'badge bg-success' : 'badge bg-danger'">
                <i
                  :class="product.isActive ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"
                  class="me-1"
                ></i>
                {{ product.isActive ? 'Available' : 'Unavailable' }}
              </span>
            </p>

            <div class="d-flex gap-1 mt-1">
              <!-- Update Button -->
              <button
                class="btn btn-sm btn-outline-dark flex-fill d-flex align-items-center justify-content-center gap-1 p-1"
                :disabled="ensureProductLoading(product).update"
                @click="updateProduct(product)"
              >
                <i
                  v-if="ensureProductLoading(product).update"
                  class="spinner-border spinner-border-sm me-1"
                ></i>
                <i v-else class="bi bi-pencil-square me-1"></i>
                <span>{{ ensureProductLoading(product).update ? 'Updating...' : 'Update' }}</span>
              </button>

              <!-- Activate / Disable Button -->
              <button
                class="btn btn-sm flex-fill d-flex align-items-center justify-content-center gap-1 p-1"
                :class="product.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                :disabled="ensureProductLoading(product).action"
                @click="product.isActive ? archiveProduct(product) : activateProduct(product)"
              >
                <span
                  v-if="ensureProductLoading(product).action"
                  class="spinner-border spinner-border-sm"
                ></span>
                <template v-if="!ensureProductLoading(product).action">
                  <i
                    :class="product.isActive ? 'bi bi-x-circle' : 'bi bi-check-circle'"
                    class="me-1"
                  ></i>
                  <span>{{ product.isActive ? 'Disable' : 'Activate' }}</span>
                </template>
                <template v-else>
                  <span>{{ product.isActive ? 'Disabling...' : 'Activating...' }}</span>
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1000px;
  margin: auto;
}

.table th,
.table td {
  padding: 0.4rem 0.6rem;
  vertical-align: middle;
}
</style>
