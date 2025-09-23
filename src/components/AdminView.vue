<template>
  <h1 class="text-center text-primary mt-5">Admin Dashboard</h1>
  <table class="table table-striped border">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Description</th>
        <th>Price</th>
        <th>Availability</th>
        <th colspan="2">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="product in productsData" :key="product._id">
        <td>{{ product._id }}</td>
        <td>{{ product.name }}</td>
        <td>{{ product.description }}</td>
        <td>{{ product.price }}</td>
        <td>
          <span v-if="product.isActive" class="text-success">Available</span>
          <span v-else class="text-danger">Unavailable</span>
        </td>
        <td>
          <button class="btn btn-primary" @click="goToEdit(product._id)">
            Edit
          </button>
        </td>
        <td>
          <button
            class="btn btn-danger"
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

// Navigate to edit page
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
