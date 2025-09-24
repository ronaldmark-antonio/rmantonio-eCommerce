<template>
  <div v-if="productData" class="col-12 col-md-6 col-lg-4 my-3">
    <div id="ProductCard" class="card p-1 cardHighlights shadow-sm" style="min-height: 100%">
        <img 
        class="card-img-top"
        :src="`https://placehold.co/600x400/377399/ffffff?font=lora&text=${encodeURIComponent(productData.name)}`"
        :alt="productData.name"
      >



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
        <p class="mb-1 text-primary">
          <span class="fw-semibold">Price: &#8369;{{ productData.price.toLocaleString() }}</span>
        </p>
        <div class="d-grid d-md-block mt-md-auto">
          <router-link class="btn btn-primary d-block" :to="{ path: `/products/${productData._id}` }">
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
    productData: Object
  }
};
</script>