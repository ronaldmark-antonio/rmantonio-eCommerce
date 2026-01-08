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
  <div class="apple-shadow p-4 my-5">

    <h1 class="text-center mb-4">
      <i class="bi bi-person-gear me-2"></i>
      Admin Dashboard
    </h1>

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
      <p class="text-dark">Looks like you're just getting started. Click "Add Product" to begin building your store!</p>
    </div>
    <table
      v-else
      class="table table-bordered table-hover align-middle text-center"
    >
      <thead>
        <tr>
          <th style="width: 200px;">Name</th>
          <th>Description</th>
          <th style="width: 120px;">Price</th>
          <th style="width: 130px;">Availability</th>
          <th colspan="2" style="width: 200px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in sortedProducts"
          :key="product._id"
          class="apple-table-row"
        >
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
              class="btn btn-sm btn-outline-success w-100 apple-btn"
              @click="updateProduct(product._id)"
            >
              <i class="bi bi-pencil-square me-1"></i> Update
            </button>
          </td>
          <td>
            <button
              class="btn btn-sm apple-btn"
              :class="product.isActive ? 'btn-outline-danger w-100' : 'btn-success'"
              @click="product.isActive ? archiveProduct(product) : activateProduct(product)"
            >
              <i
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
</template>



