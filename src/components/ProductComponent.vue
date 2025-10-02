<template>
  <div v-if="productData" class="col-12 col-md-6 col-lg-4 my-3">
    <div
      id="ProductCard"
      class="card p-1 cardHighlights apple-shadow apple-hover border-0"
      style="min-height: 100%; border: none; background-color: #fff;">
      
      <img
  class="card-img-top rounded"
  :src="getCloudinaryImageUrl(productData.image)"
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
  methods: {
  getCloudinaryImageUrl(publicId) {
    const cloudName = "djanrocmu";

    if (!publicId) {
      return `https://placehold.co/600x400/ffffff/000000?font=lora&text=${encodeURIComponent(this.productData.name)}`;
    }

    if (publicId.startsWith("http")) {
      return publicId; // already a URL
    }

    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
  }
}

};

</script>

