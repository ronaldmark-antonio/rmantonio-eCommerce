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

        <!-- Buttons -->
        <div class="d-grid d-md-block mt-md-auto gap-2">
          <!-- Add to Cart -->
          <button
            class="btn btn-outline-success w-100 mb-1 d-flex align-items-center justify-content-center gap-2"
            :disabled="addingToCart"
            @click="addToCart"
          >
            <span
              v-if="addingToCart"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>

            <template v-if="!addingToCart">
              <i class="bi bi-cart-plus"></i>
              <span>Add to cart</span>
            </template>

            <template v-else>
              <span>Adding...</span>
            </template>
          </button>

          <!-- Details -->
          <button
            class="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
            :disabled="isLoading"
            @click="goToDetails"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>

            <template v-if="!isLoading">
              <i class="bi bi-info-circle"></i>
              <span>Details</span>
            </template>

            <template v-else>
              <span>Loading...</span>
            </template>
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { useGlobalStore } from "../stores/global";
import { Notyf } from "notyf";
import { useRouter } from "vue-router";
import api from "../api";

const props = defineProps({
  productData: Object
});

const globalStore = useGlobalStore();
const router = useRouter();
const notyf = new Notyf();

// Reactive states
const isLoading = ref(false);      // Details button
const addingToCart = ref(false);   // Add to cart
const quantity = ref(1);
const subtotal = ref(props.productData.price);

// Navigate to product details
const goToDetails = async () => {
  if (isLoading.value) return;
  isLoading.value = true;

  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 100)); // spinner visible

  router.push(`/products/${props.productData._id}`);
};

// Add to cart with spinner + Notyf + login check
const addToCart = async () => {
  if (addingToCart.value) return;

  // Start spinner immediately
  addingToCart.value = true;
  await nextTick(); // ensure spinner renders

  // Check login
  if (!globalStore.user.token) {
    notyf.error("Please login first");
    // Give a tiny delay so spinner is visible before redirect
    await new Promise(resolve => setTimeout(resolve, 200));
    addingToCart.value = false; // stop spinner after redirect
    return router.push("/login");
  }

  // User is logged in → proceed to add to cart
  const payload = {
    productId: props.productData._id,
    quantity: quantity.value,
    subtotal: subtotal.value
  };

  try {
    await api.post(
      "https://rmantonio-ecommerceapi.onrender.com/cart/add-to-cart",
      payload
    );
    notyf.success("Added to cart");
  } catch (err) {
    console.error("Add to cart failed:", err);
    notyf.error("Server error: Failed to add to cart");
  } finally {
    addingToCart.value = false;
  }
};
</script>

<style scoped>
.d-grid button {
  min-height: 38px;
}

</style>
