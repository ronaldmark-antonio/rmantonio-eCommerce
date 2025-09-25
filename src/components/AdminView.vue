<script setup>
import { defineProps } from "vue";
import { useRouter } from "vue-router";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import api from "../api";

const props = defineProps({
  productsData: Array,
});

const router = useRouter();
const notyf = new Notyf();

function updateProduct(id) {
  router.push(`/products/edit/${id}`);
};

async function archiveProduct(product) {
    try {
      let res = await api.patch(`/products/${product._id}/archive`)
      if (res.status === 200) {
        product.isActive = false;
        notyf.success("Product archived.");
      } else {
        notyf.error("Failed to archive product");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      notyf.error("Server error: Could not archive product");
    }
  };

async function activateProduct(product) {
  try {
    let res = await api.patch(`/products/${product._id}/activate`)
    if (res.status === 200) {
      product.isActive = true;
      notyf.success("Product set as active.");
    } else {
      notyf.error("Server error in marking product as active.")
    }
  } catch (error) {
    console.error("Product activation error", error);
    notyf.error("Server error: Could not activate product.");
  }
}
</script>

<template>
  <h1 class="text-center mt-5">Admin Dashboard</h1>
  <div class="row">
    <div class="col text-center my-3">
      <RouterLink class="btn btn-primary mx-2" to="/addProduct">Add Product</RouterLink>
      <RouterLink class="btn btn-success mx-2" to="/?">Orders</RouterLink>
    </div>
  </div>

  <div class="apple-shadow p-4">
    <table class="table table-bordered table-hover align-middle text-center">
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
        <tr v-for="product in productsData" :key="product._id" class="apple-table-row">
          <td class="text-start">{{ product.name }}</td>
          <td class="text-start">{{ product.description }}</td>
          <td>&#8369;{{ product.price.toLocaleString() }}</td>
          <td>
            <span v-if="product.isActive" class="badge bg-success">Available</span>
            <span v-else class="badge bg-danger">Unavailable</span>
          </td>
          <td>
            <button class="btn btn-sm btn-primary w-100 apple-btn" @click="updateProduct(product._id)">
              Update
            </button>
          </td>
          <td>
            <button
              class="btn btn-sm w-100 apple-btn"
              :class="product.isActive ? 'btn-danger' : 'btn-success'"
              @click="product.isActive ? archiveProduct(product) : activateProduct(product)"
            >
              {{ product.isActive ? 'Disable' : 'Activate' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.apple-shadow {
  box-shadow:
    0 10px 15px rgba(0, 0, 0, 0.08),
    0 4px 6px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  background-color: #ffffff;
  transition: box-shadow 0.3s ease-in-out;
}

.apple-shadow:hover {
  box-shadow:
    0 15px 25px rgba(0, 0, 0, 0.1),
    0 5px 10px rgba(0, 0, 0, 0.08);
}
</style>



