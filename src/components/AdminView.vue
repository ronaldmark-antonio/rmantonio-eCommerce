<script setup>
import { defineProps } from "vue";
import { useRouter } from "vue-router";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const props = defineProps({
  productsData: Array,
});

const router = useRouter();
const notyf = new Notyf();

const goToEdit = (id) => {
  router.push(`/products/${id}/edit`);
};

// Archive product using DELETE method
const archiveproduct = async (product) => {
  const token = localStorage.getItem("token");
  if (!token) return notyf.error("You must be logged in as admin");

  try {
    const response = await fetch(`http://localhost:4000/products/${product._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    let data;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (response.status === 200) {
      if (data.success) {
        notyf.success(data.message || "product Archived Successfully");
        // Update local product object to reflect change
        product.isActive = false;
      } else if (data.message === "product already archived") {
        notyf.warning(data.message);
      }
    } else if (response.status === 404) {
      notyf.error(data.message || "product not found");
    } else {
      notyf.error(data.message || "Failed to archive product");
    }

  } catch (error) {
    console.error("Fetch error:", error);
    notyf.error("Server error: Could not archive product");
  }
};
</script>

<template>
  <h1 class="text-center mt-5">Admin Dashboard</h1>
  <div class="row">
    <div class="col text-center my-3">
      <RouterLink class="btn btn-primary mx-2" to="/addProduct">Add Product</RouterLink>
      <RouterLink class="btn btn-success mx-2" to="/?">Orders</RouterLink>
    </div>
  </div>

  <table class="table table-striped table-bordered table-hover align-middle text-center">
  <thead class="table-primary">
    <tr>
      <th style="width: 200px;">Name</th>
      <th>Description</th>
      <th style="width: 120px;">Price</th>
      <th style="width: 130px;">Availability</th>
      <th colspan="2" style="width: 200px;">Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="product in productsData" :key="product._id">
      <td class="text-start">{{ product.name }}</td>
      <td class="text-start">{{ product.description }}</td>
      <td>&#8369;{{ product.price.toLocaleString() }}</td>
      <td>
        <span v-if="product.isActive" class="badge bg-success">Available</span>
        <span v-else class="badge bg-danger">Unavailable</span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary w-100" @click="goToEdit(product._id)">
          Edit
        </button>
      </td>
      <td>
        <button
          class="btn btn-sm btn-danger w-100"
          :disabled="!product.isActive"
          @click="archiveproduct(product)"
        >
          {{ product.isActive ? "Archive" : "Archived" }}
        </button>
      </td>
    </tr>
  </tbody>
</table>

</template>

