<script setup>
import { defineProps, computed } from "vue";
import { useRouter } from "vue-router";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import api from "../api";

const router = useRouter();
const notyf = new Notyf();

const props = defineProps({
  productsData: Array,
});

function updateProduct(id) {
  router.push(`/products/edit/${id}`);
}

async function archiveProduct(product) {
  try {
    let res = await api.patch(
      `https://rmantonio-ecommerceapi.onrender.com/products/${product._id}/archive`
    );
    if (res.status === 200) {
      product.isActive = false;
      notyf.success("Product archived successfully");
    } else {
      notyf.error("Failed to archive product");
    }
  } catch (error) {
    console.error("Product archive error", error);
    notyf.error("Server error: Could not archive product");
  }
}

async function activateProduct(product) {
  try {
    let res = await api.patch(
      `https://rmantonio-ecommerceapi.onrender.com/products/${product._id}/activate`
    );
    if (res.status === 200) {
      product.isActive = true;
      notyf.success("Product activated successfully");
    } else {
      notyf.error("Failed to activate product");
    }
  } catch (error) {
    console.error("Product activation error", error);
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
      Admin Dashboard
    </h1>
    <p class="text-center mb-3 pb-1">
        Welcome back admin! Manage your store with ease.
    </p>

    <div class="row mb-4">
      <div class="col text-center">
        <RouterLink class="btn btn-success mx-2" to="/addProduct">
          <i class="bi bi-plus-circle me-1"></i> Add Product
        </RouterLink>

        <RouterLink class="btn btn-outline-success mx-2" to="/orders">
          <i class="bi bi-cart-check me-1"></i> Orders
        </RouterLink>
      </div>
    </div>

    <div v-if="productsData.length === 0" class="text-center my-5">
      <h3>Your Product Catalog is Empty</h3>
      <p class="text-dark">Click "Add Product" to begin building your store!</p>
    </div>

    <div v-else>
      <!-- Desktop table -->
      <table class="table table-bordered table-hover align-middle text-center desktop-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Availability</th>
            <th colspan="2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in sortedProducts" :key="product._id">
            <td class="text-start">{{ product.name }}</td>
            <td class="text-start">{{ product.description }}</td>
            <td>&#8369;{{ product.price.toLocaleString() }}</td>
            <td>
              <span v-if="product.isActive" class="badge bg-success">
                <i class="bi bi-check-circle-fill me-1"></i> Available
              </span>
              <span v-else class="badge bg-danger">
                <i class="bi bi-x-circle-fill me-1"></i> Unavailable
              </span>
            </td>
            <td>
              <button
                class="btn btn-sm btn-outline-dark w-100"
                @click="updateProduct(product._id)"
              >
                <i class="bi bi-pencil-square me-1"></i> Update
              </button>
            </td>
            <td>
              <button
                class="btn btn-sm w-100"
                :class="product.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                @click="product.isActive ? archiveProduct(product) : activateProduct(product)"
              >
                <i :class="product.isActive ? 'bi bi-x-circle' : 'bi bi-check-circle'" class="me-1"></i>
                {{ product.isActive ? 'Disable' : 'Activate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile cards -->
      <div class="mobile-cards d-md-none">
        <div v-for="product in sortedProducts" :key="product._id" class="card mb-3">
          <div class="card-body p-3">
            <h5 class="card-title mb-2">{{ product.name }}</h5>
            <p class="card-text mb-1"><strong>Description:</strong> {{ product.description }}</p>
            <p class="card-text mb-1"><strong>Price:</strong> &#8369;{{ product.price.toLocaleString() }}</p>
            <p class="card-text mb-2">
              <strong>Availability:</strong>
              <span v-if="product.isActive" class="badge bg-success">Available</span>
              <span v-else class="badge bg-danger">Unavailable</span>
            </p>
            <div class="d-flex gap-2 flex-wrap">
              <button
                class="btn btn-sm btn-outline-dark flex-fill"
                @click="updateProduct(product._id)"
              >
                <i class="bi bi-pencil-square me-1"></i> Update
              </button>
              <button
                class="btn btn-sm flex-fill"
                :class="product.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                @click="product.isActive ? archiveProduct(product) : activateProduct(product)"
              >
                <i :class="product.isActive ? 'bi bi-x-circle' : 'bi bi-check-circle'" class="me-1"></i>
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
  margin: 0 auto;
}

/* Reduce table cell padding */
.table th, .table td {
  padding: 0.3rem 0.5rem;
  vertical-align: middle;
  word-wrap: break-word;
}

/* Desktop vs Mobile */
.desktop-table {
  display: table;
}
.mobile-cards {
  display: none;
}

/* Mobile view */
@media (max-width: 767px) {
  .desktop-table {
    display: none;
  }
  .mobile-cards {
    display: block;
  }

  .card {
    font-size: 0.85rem;
  }

  .btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.4rem;
  }
}
</style>







