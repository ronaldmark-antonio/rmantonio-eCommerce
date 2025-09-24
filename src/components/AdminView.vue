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

  function goToEdit(id) {
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

</script>

<template>
  <h1 class="text-center text-primary my-5">Admin Dashboard</h1>
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
            @click="archiveProduct(product)"
          >
            {{ product.isActive ? "Archive" : "Archived" }}
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
