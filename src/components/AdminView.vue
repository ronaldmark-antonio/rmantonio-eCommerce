<script setup>
import { defineProps, computed, reactive } from "vue";
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

// 🔥 Independent loading states per action
const loading = reactive({
  add: false,
  orders: false,
  // productId: { update: false, activate: false, disable: false }
});

// Helper: ensure product has loading object
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
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return b._id.localeCompare(a._id);
  });
});
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
      <RouterLink
        class="btn btn-success mx-2"
        to="/addProduct"
        @click="loading.add = true"
      >
        <i v-if="loading.add" class="spinner-border spinner-border-sm me-1"></i>
        <i v-else class="bi bi-plus-circle me-1"></i>
        Add Product
      </RouterLink>

      <RouterLink
        class="btn btn-outline-success mx-2"
        to="/orders"
        @click="loading.orders = true"
      >
        <i v-if="loading.orders" class="spinner-border spinner-border-sm me-1"></i>
        <i v-else class="bi bi-cart-check me-1"></i>
        Orders
      </RouterLink>
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
        <table class="table table-bordered table-hover align-middle text-center">
          <thead class="table-light">
            <tr>
              <th class="text-start" style="width: 120px;">Name</th>
              <th class="text-start" style="width: 300px;">Description</th>
              <th style="width: 100px;">Price</th>
              <th style="width: 130px;">Availability</th>
              <th colspan="2" style="width: 90px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in sortedProducts" :key="product._id">
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
              <td>
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
        <div v-for="product in sortedProducts" :key="product._id" class="card mb-2">
          <div class="card-body p-2">
            <h5 class="mb-1">{{ product.name }}</h5>
            <p class="mb-1 text-truncate">Description: {{ product.description }}</p>
            <p class="mb-1">Price: ₱{{ product.price?.toLocaleString() }}</p>
            <p class="mb-1">
              Availability:
              <span :class="product.isActive ? 'badge bg-success' : 'badge bg-danger'">
                <i :class="product.isActive ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'" class="me-1"></i>
                {{ product.isActive ? 'Available' : 'Unavailable' }}
              </span>
            </p>
            <div class="d-flex gap-1 mt-1">
              <!-- Update -->
              <button
                class="btn btn-sm btn-outline-dark flex-fill p-1"
                :disabled="ensureProductLoading(product).update"
                @click="updateProduct(product)"
              >
                <i
                  v-if="ensureProductLoading(product).update"
                  class="spinner-border spinner-border-sm me-1"
                ></i>
                <i v-else class="bi bi-pencil-square me-1"></i>
                Update
              </button>
              <!-- Activate / Disable -->
              <button
                class="btn btn-sm flex-fill p-1"
                :class="product.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                :disabled="ensureProductLoading(product).action"
                @click="product.isActive ? archiveProduct(product) : activateProduct(product)"
              >
                <i
                  v-if="ensureProductLoading(product).action"
                  class="spinner-border spinner-border-sm me-1"
                ></i>
                <i
                  v-else
                  :class="product.isActive ? 'bi bi-x-circle' : 'bi bi-check-circle'"
                  class="me-1"
                ></i>
                {{ product.isActive ? "Disable" : "Activate" }}
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
  max-width: 900px;
  margin: auto;
}

.table th,
.table td {
  padding: 0.4rem 0.6rem;
  vertical-align: middle;
}
</style>
