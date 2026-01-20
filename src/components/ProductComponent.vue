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

<style scoped>
@media (max-width: 767px) {
  #ProductCard {
    padding: 0.25rem;
  }

  #ProductCard img {
    height: 140px;
    object-fit: cover;
  }

  #ProductCard .card-body {
    padding: 0.5rem;
  }

  #ProductCard .card-title {
    font-size: 0.9rem;
  }

  #ProductCard .card-text,
  #ProductCard p {
    font-size: 0.8rem;
    line-height: 1.3;
  }

  #ProductCard .btn {
    font-size: 0.75rem;
    padding: 0.35rem;
  }
}

/* Mobile-specific Apple shadow */
@media (max-width: 767px) {
  .apple-shadow {
    box-shadow:
      0 12px 18px rgba(0, 0, 0, 0.18),
      0 6px 12px rgba(0, 0, 0, 0.16);
    border-radius: 16px;
    background-color: #ffffff;
  }

  /* Disable hover effects on mobile */
  .apple-shadow:hover {
    box-shadow:
      0 12px 18px rgba(0, 0, 0, 0.18),
      0 6px 12px rgba(0, 0, 0, 0.16);
    transform: none;
  }
}

</style>


