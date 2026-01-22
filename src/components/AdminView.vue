<script setup>
import { defineProps, computed } from "vue";
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

function updateProduct(id) {
  router.push(`/products/edit/${id}`);
}

async function archiveProduct(product) {
  try {
    const res = await api.patch(
      `https://rmantonio-ecommerceapi.onrender.com/products/${product._id}/archive`
    );
    if (res.status === 200) {
      product.isActive = false;
      notyf.success("Product archived successfully");
    }
  } catch (error) {
    notyf.error("Server error: Could not archive product");
  }
}

async function activateProduct(product) {
  try {
    const res = await api.patch(
      `https://rmantonio-ecommerceapi.onrender.com/products/${product._id}/activate`
    );
    if (res.status === 200) {
      product.isActive = true;
      notyf.success("Product activated successfully");
    }
  } catch (error) {
    notyf.error("Server error: Could not activate product");
  }
}

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

    <div class="text-center mb-4">
      <RouterLink class="btn btn-success mx-2" to="/addProduct">
        <i class="bi bi-plus-circle me-1"></i> Add Product
      </RouterLink>

      <RouterLink class="btn btn-outline-success mx-2" to="/orders">
        <i class="bi bi-cart-check me-1"></i> Orders
      </RouterLink>
    </div>

    <!-- EMPTY STATE -->
    <div v-if="sortedProducts.length === 0" class="text-center my-5">
      <h3>Your Product Catalog is Empty</h3>
      <p>Click "Add Product" to begin building your store!</p>
    </div>

    <div v-else>
      <!-- DESKTOP TABLE -->
      <div class="table-responsive d-none d-md-block">
        <table class="table table-bordered table-hover align-middle text-center">
          <thead class="table-light">
            <tr>
              <th class="text-start" style="width: 150px;">Name</th>
              <th class="text-start" style="width: 250px;">Description</th>
              <th style="width: 100px;">Price</th>
              <th style="width: 120px;">Availability</th>
              <th colspan="2" style="width: 90px;">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="product in sortedProducts" :key="product._id">
              <td class="text-start" style="width: 150px;">{{ product.name }}</td>

              <td class="text-start description-cell" style="width: 250px;">
                {{ product.description }}
              </td>

              <td style="width: 100px;">₱{{ product.price?.toLocaleString() }}</td>

              <td style="width: 120px;">
                <span v-if="product.isActive" class="badge bg-success">
                  <i class="bi bi-check-circle-fill me-1"></i>
                  Available
                </span>
                <span v-else class="badge bg-danger">
                  <i class="bi bi-x-circle-fill me-1"></i>
                  Unavailable
                </span>
              </td>

              <td>
                <button
                  class="btn btn-sm btn-outline-dark" 
                  style="width: 100px;"
                  @click="updateProduct(product._id)"
                ><i class="bi bi-pencil-square me-1"></i> Update
                </button>
              </td>

              <td>
                <button
                  class="btn btn-sm"
                  style="width: 100px;"
                  :class="product.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                  @click="product.isActive ? archiveProduct(product) : activateProduct(product)"
                ><i
                  :class="product.isActive ? 'bi bi-x-circle' : 'bi bi-check-circle'"
                  class="me-1"
                ></i>
                  {{ product.isActive ? 'Disable' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE CARDS -->
      <div class="d-md-none">
        <div
          v-for="product in sortedProducts"
          :key="product._id"
          class="card mb-2" > 
        
          <div class="card-body p-2"> 
            <h5 class="mb-1">{{ product.name }}</h5> 

            <p class="mb-1 text-truncate" style="max-width: 100%;">
              Description: {{ product.description }}
            </p>

            <p class="mb-1">Price: ₱{{ product.price?.toLocaleString() }}</p>

            <p class="mb-1">Availability: 
              <span
                class="badge"
                :class="product.isActive ? 'bg-success' : 'bg-danger'"
              >
                <i
                  :class="product.isActive ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"
                  class="me-1"
                ></i>
                {{ product.isActive ? 'Available' : 'Unavailable' }}
              </span>
            </p>

            <div class="d-flex gap-1 mt-1">
              <button
                class="btn btn-sm btn-outline-dark flex-fill p-1"
                @click="updateProduct(product._id)"
              >
                <i class="bi bi-pencil-square me-1"></i> Update
              </button>

              <button
                class="btn btn-sm flex-fill p-1"
                :class="product.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                @click="product.isActive ? archiveProduct(product) : activateProduct(product)"
              >
                <i
                  :class="product.isActive ? 'bi bi-x-circle' : 'bi bi-check-circle'"
                  class="me-1"
                ></i>
                {{ product.isActive ? 'Disable' : 'Activate' }}
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

.description-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table th,
.table td {
  padding: 0.4rem 0.6rem;
  vertical-align: middle;
}
</style>
