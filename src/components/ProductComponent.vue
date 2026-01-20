<template>
  <div v-if="productData" class="col-12 col-md-6 col-lg-3 my-3">
    <div
      id="ProductCard"
      class="card p-1 cardHighlights apple-shadow apple-hover border-0"
      style="min-height: 100%; background-color: #fff;"
    >
      <img
        class="card-img-top rounded"
        :src="`https://placehold.co/600x400/ffffff/000000?font=lora&text=${encodeURIComponent(productData.name)}`"
        :alt="productData.name"
      />

      <div class="card-body d-flex flex-column">
        <h6 class="card-title mb-0">{{ productData.name }}</h6>

        <p class="card-text mb-0">
          {{
            productData.description
              ? productData.description.slice(0, 100) +
                (productData.description.length > 100 ? '...' : '')
              : 'No description available.'
          }}
        </p>

        <p class="mb-2">
          Price: &#8369;{{ productData.price.toLocaleString() }}
        </p>

        <div class="d-grid d-md-block mt-md-auto">
          <router-link
            class="btn btn-success d-block"
            :to="{ path: `/products/${productData._id}` }"
          >
            <i class="bi bi-info-circle me-1"></i> Details
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

