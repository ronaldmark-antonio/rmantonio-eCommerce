<script setup>
import { defineProps, computed, reactive, ref, watch } from "vue";
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

const priceFilter = reactive({
  min: null,
  max: null,
});


function ensureProductLoading(product) {
  if (!loading[product._id]) {
    loading[product._id] = { update: false, action: false };
  }
  return loading[product._id];
}

function updateProduct(product) {
  const prodLoad = ensureProductLoading(product);
  prodLoad.update = true;
  setTimeout(() => {
    router.push(`/products/edit/${product._id}`);
    prodLoad.update = false;
  }, 300);
}

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
    loading.add = false;
  }, 200);
}

function goToOrders() {
  if (loading.orders) return;
  loading.orders = true;
  setTimeout(() => {
    router.push("/orders");
    loading.orders = false;
  }, 200);
}

const searchInput = ref("");
const availabilityFilter = ref("all");
const filteredProducts = ref([]);
const searchLoading = ref(false);
const priceSort = ref(null);


watch(
  sortedProducts,
  (newProducts) => {
    filteredProducts.value = [...newProducts];
  },
  { immediate: true }
);

function performSearch(isFilterChange = false) {
  if (!isFilterChange) searchLoading.value = true;

  setTimeout(() => {
    const query = searchInput.value.trim().toLowerCase();

    let results = sortedProducts.value.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      const matchesAvailability =
        availabilityFilter.value === "all" ||
        (availabilityFilter.value === "available" && product.isActive) ||
        (availabilityFilter.value === "unavailable" && !product.isActive);

      const matchesPrice =
        (priceFilter.min === null || product.price >= priceFilter.min) &&
        (priceFilter.max === null || product.price <= priceFilter.max);

      return matchesSearch && matchesAvailability && matchesPrice;
    });

    if (priceFilter.min !== null || priceFilter.max !== null) {
      priceSort.value = "asc";
    } else {
      priceSort.value = null;
    }

    if (priceSort.value === "asc") {
      results.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    }

    filteredProducts.value = results;

    if (!isFilterChange) searchLoading.value = false;
  }, isFilterChange ? 0 : 300);
}

function applyQuickPriceFilter(min, max) {
  priceFilter.min = min;
  priceFilter.max = max;
  priceSort.value = "asc";
  performSearch(true);
}


const resetLoading = ref(false);

function resetSearch() {
  resetLoading.value = true;
  priceSort.value = null;

  setTimeout(() => {
    searchInput.value = "";
    availabilityFilter.value = "all";
    priceFilter.min = null;
    priceFilter.max = null;
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

          <!-- Availability Filter -->
          <div class="d-flex align-items-center gap-1">
            <label for="availabilityFilter" class="mb-0">Availability:</label>
            <select
              id="availabilityFilter"
              class="form-select"
              style="width: 150px;"
              v-model="availabilityFilter"
              @change="performSearch"
              :disabled="searchLoading || resetLoading"
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        <!-- Quick Price Filters -->
        <div class="d-flex justify-content-center gap-2 mb-3 flex-wrap">
          <button
            class="btn btn-sm"
            :class="priceFilter.max === 29999 ? 'btn-success' : 'btn-outline-success'"
            @click="applyQuickPriceFilter(null, 29999)"
          >
            Under ₱30,000
          </button>

          <button
            class="btn btn-sm"
            :class="priceFilter.min === 30000 && priceFilter.max === 50000 ? 'btn-success' : 'btn-outline-success'"
            @click="applyQuickPriceFilter(30000, 50000)"
          >
            ₱30,000 – ₱50,000
          </button>

          <button
            class="btn btn-sm"
            :class="priceFilter.min === 51000 && priceFilter.max === 100000 ? 'btn-success' : 'btn-outline-success'"
            @click="applyQuickPriceFilter(51000, 100000)"
          >
            ₱51,000 – ₱100,000
          </button>

          <button
            class="btn btn-sm btn-outline-secondary"
            @click="applyQuickPriceFilter(null, null)"
          >
            Clear Price
          </button>
        </div>

        <!-- EMPTY FILTER RESULT -->
        <div
          v-if="filteredProducts.length === 0 && sortedProducts.length > 0"
          class="text-center my-5 text-muted"
        >
        <i
        :class="availabilityFilter === 'available'
        ? 'bi bi-check-circle'
        : availabilityFilter === 'unavailable'
        ? 'bi bi-x-circle'
        : 'bi bi-search'"
        class="display-4 mb-3 d-block"
        ></i>

          <h5 class="fw-semibold">
            No
            {{
              availabilityFilter === 'available'
                ? 'Available'
                : availabilityFilter === 'unavailable'
                ? 'Unavailable'
                : ''
            }}
            Products Found
          </h5>

          <p class="mb-0">
            Try changing the availability filter or clearing your search.
          </p>
        </div>

        <table v-if="filteredProducts.length > 0" class="table table-bordered table-hover align-middle text-center">
          <thead class="table-light">
            <tr>
              <th class="text-start text-center" style="width: 350px;">Name</th>
              <th class="text-start text-center" style="width: 400px;">Description</th>
              <th class="text-start text-center" style="width: 80px;">Price</th>
              <th class="text-start text-center" style="width: 80px;">Availability</th>
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
                  <span v-if="ensureProductLoading(product).update" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>

                  <template v-if="!ensureProductLoading(product).update">
                    <i class="bi bi-pencil-square"></i>
                    <span>Update</span>
                  </template>

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
                  <span v-if="ensureProductLoading(product).action" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>

                  <template v-if="!ensureProductLoading(product).action">
                    <i :class="product.isActive ? 'bi bi-x-circle' : 'bi bi-check-circle'"></i>
                    <span>{{ product.isActive ? 'Disable' : 'Activate' }}</span>
                  </template>

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
          <!-- Search Input -->
          <input
            type="text"
            class="form-control mb-2"
            placeholder="Search products by name or description..."
            v-model="searchInput"
            @keyup.enter="performSearch"
            :disabled="searchLoading || resetLoading"
          />

          <div class="d-flex gap-2 mb-2">
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

          <!-- Filter + Buttons -->
          <div class="d-flex gap-2 mb-2">
            <!-- Availability Filter -->
            <div class="flex-fill d-flex align-items-center gap-1">
              <label for="mobileAvailabilityFilter" class="mb-0">Availability:</label>
              <select
                id="mobileAvailabilityFilter"
                class="form-select"
                v-model="availabilityFilter"
                @change="performSearch(true)"
                :disabled="searchLoading || resetLoading"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Quick Price Filters -->
        <div class="d-flex justify-content-center gap-2 mb-3 flex-wrap">
          <button
            class="btn btn-sm"
            :class="priceFilter.max === 29999 ? 'btn-success' : 'btn-outline-success'"
            @click="applyQuickPriceFilter(null, 29999)"
          >
            Under ₱30,000
          </button>

          <button
            class="btn btn-sm"
            :class="priceFilter.min === 30000 && priceFilter.max === 50000 ? 'btn-success' : 'btn-outline-success'"
            @click="applyQuickPriceFilter(30000, 50000)"
          >
            ₱30,000 – ₱50,000
          </button>

          <button
            class="btn btn-sm"
            :class="priceFilter.min === 51000 && priceFilter.max === 100000 ? 'btn-success' : 'btn-outline-success'"
            @click="applyQuickPriceFilter(51000, 100000)"
          >
            ₱51,000 – ₱100,000
          </button>

          <button
            class="btn btn-sm btn-outline-secondary"
            @click="applyQuickPriceFilter(null, null)"
          >
            Clear Price
          </button>
        </div>

        <!-- EMPTY FILTER RESULT -->
        <div
          v-if="filteredProducts.length === 0 && sortedProducts.length > 0"
          class="text-center my-5 text-muted"
        >
        <i
        :class="availabilityFilter === 'available'
        ? 'bi bi-check-circle'
        : availabilityFilter === 'unavailable'
        ? 'bi bi-x-circle'
        : 'bi bi-search'"
        class="display-4 mb-3 d-block"
        ></i>

          <h5 class="fw-semibold">
            No
            {{
              availabilityFilter === 'available'
                ? 'Available'
                : availabilityFilter === 'unavailable'
                ? 'Unavailable'
                : ''
            }}
            Products Found
          </h5>

          <p class="mb-0">
            Try changing the availability filter or clearing your search.
          </p>
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
