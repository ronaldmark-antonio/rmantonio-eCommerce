<script setup>
import { onBeforeMount, reactive, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api";
import { useGlobalStore } from "../stores/global";
import { Notyf } from "notyf";

const quantity = ref(1);
const notyf = new Notyf();
const router = useRouter();
const { user } = useGlobalStore();
const loading = ref(false);
const product = reactive({ data: null });

const subtotal = computed(() => {
  if (!product.data) return 0;
  return product.data.price * quantity.value;
});

const incrementQuantity = () => {
  quantity.value++;
};

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const validateQuantity = () => {
  if (!quantity.value || quantity.value < 1) {
    quantity.value = 1;
  }
};

onBeforeMount(async () => {
  const route = useRoute();
  let { data } = await api.get(
    `https://rmantonio-ecommerceapi.onrender.com/products/${route.params.productId}`
  );
  product.data = data;
});

async function addToCart() {
  const payload = {
    productId: product.data._id,
    quantity: quantity.value,
    subtotal: subtotal.value
  };

  loading.value = true;
  try {
    await api.post(
      "https://rmantonio-ecommerceapi.onrender.com/cart/add-to-cart",
      payload
    );
    notyf.success("Added to cart");
  } catch (error) {
    console.error("Fetch error:", error);
    notyf.error("Server error: Failed to add to cart");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container">
    <nav class="my-3" aria-label="breadcrumb">
      <ol class="breadcrumb bg-light p-2 rounded small">
        <li class="breadcrumb-item">
          <router-link to="/" class="text-decoration-none text-success">
            <i class="bi bi-house-door"></i> Home
          </router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link to="/products" class="text-decoration-none text-success">
            <i class="bi bi-phone"></i> Mobile Phones
          </router-link>
        </li>
        <li class="breadcrumb-item active text-dark" aria-current="page">
          <i class="bi bi-tag"></i>
          {{ product.data ? product.data.name : "Loading..." }}
        </li>
      </ol>
    </nav>

    <div class="row mx-auto my-3 gap-4 gap-md-0" v-if="product.data">
      <div class="col-12 col-md-6">
        <img
          class="img-fluid rounded apple-shadow apple-hover"
          :src="`https://placehold.co/600x400/ffffff/000000?font=lora&text=${encodeURIComponent(product.data.name)}`"
        />
      </div>

      <div class="col-12 col-md-6">
        <h3 class="mb-3">{{ product.data.name }}</h3>

        <p class="mb-0">{{ product.data.description }}</p>

        <p class="mb-3">
          Price: &#8369;{{ product.data.price.toLocaleString() }}
        </p>

        <p class="mb-0">
          Subtotal:
          <span class="text-dark">
            &#8369;{{ subtotal.toLocaleString() }}
          </span>
        </p>

        <div class="mb-2">
          <label class="form-label">Quantity:</label>
          <div class="input-group input-group-sm" style="width: 110px;">
            <button
              class="btn btn-success"
              type="button"
              @click="decrementQuantity"
              :disabled="quantity <= 1"
            >
              -
            </button>

            <input
              type="number"
              class="form-control text-center"
              v-model.number="quantity"
              min="1"
              @input="validateQuantity"
              style="max-width: 50px;"
              @keydown.prevent
              @paste.prevent
            />

            <button
              class="btn btn-success"
              type="button"
              @click="incrementQuantity"
            >
              +
            </button>
          </div>

          <router-link
            to="/login"
            class="btn btn-outline-success btn-sm mt-2 d-inline-flex align-items-center gap-1"
            v-if="!user.email"
          >
            <i class="bi bi-box-arrow-in-right"></i>
            <i class="bi bi-cart"></i>
            <span>Login to Add</span>
          </router-link>

          <button
            class="btn btn-sm btn-success my-3 d-inline-flex align-items-center gap-2"
            v-else
            @click="addToCart"
            :disabled="loading"
          >
            <!-- Spinner while loading -->
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>

            <!-- Normal icon when not loading -->
            <i v-else class="bi bi-cart-plus"></i>

            <span>
              {{ loading ? "Adding..." : "Add to cart" }}
            </span>
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
