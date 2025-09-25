<template>
  <div v-if="productData" class="col-12 col-md-6 col-lg-4 my-3">
    <div
      id="ProductCard"
      class="card p-1 cardHighlights apple-shadow apple-hover border-0"
      style="min-height: 100%; border: none; background-color: #fff;">
      
      <img
        class="card-img-top rounded"
        :src="`https://placehold.co/600x400/ffffff/000000?font=lora&text=${encodeURIComponent(productData.name)}`"
        :alt="productData.name"
        style="border: none;"
      />
      
      <div class="card-body d-flex flex-column gap-2">
        <h4 class="card-title fw-bold mb-2">
          {{ productData.name }}
        </h4>
        <p class="card-text text-muted mb-2">
          {{
            productData.description
              ? productData.description.slice(0, 100) + (productData.description.length > 100 ? '...' : '')
              : 'No description available.'
          }}
        </p>
        <p class="mb-1">
          <span class="fw-semibold">Price: &#8369;{{ productData.price.toLocaleString() }}</span>
        </p>
        <div class="d-grid d-md-block mt-md-auto">
          <router-link
            class="btn btn-success d-block"
            :to="{ path: `/products/${productData._id}` }"
          >
            Details
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { useGlobalStore } from "../stores/global";
import { Notyf } from "notyf";

const notyf = new Notyf();

export default {
  props: {
    productData: Object,
  },
};
</script>

<style scoped>
.apple-shadow {
  box-shadow:
    0 10px 15px rgba(0, 0, 0, 0.08),
    0 4px 6px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  background-color: #ffffff;
}

.apple-hover:hover {
  box-shadow:
    0 20px 30px rgba(0, 0, 0, 0.1),
    0 8px 15px rgba(0, 0, 0, 0.08);
}
</style>

