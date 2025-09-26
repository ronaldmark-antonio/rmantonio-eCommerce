<script setup>
import { onBeforeMount, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api";

import { useGlobalStore } from "../stores/global";
import { Notyf } from "notyf";
import { ref } from 'vue';

const quantity = ref(1);
const notyf = new Notyf();
const { user } = useGlobalStore();

const router = useRouter();
const product = reactive({ data: null });

onBeforeMount(async () => {
    const route = useRoute();
    let { data } = await api.get(`/products/${route.params.productId}`);

    product.data = data;
});

async function addToCart() {

  const subtotal  = product.data.price * quantity.value;
  
  const payload = {
    productId: product.data._id,
    quantity: quantity.value,
    subtotal : subtotal 
  };

  try {
    const res = await api.post('/cart/add-to-cart', payload, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });

    notyf.success("Added to Cart.");
  
  } catch (error) {
    console.error("Fetch error:", error);
    notyf.error("Server error: Failed to Add to Cart.");
  }
}
</script>

<template>
    <div class="container">
        <nav class="my-3" aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><router-link to="/products">Products</router-link></li>
                <li class="breadcrumb-item active" aria-current="page">
                    {{ product.data ? product.data.name : "..." }}
                </li>
            </ol>
        </nav>
        <div class="row mx-auto my-3 gap-4 gap-md-0" v-if="product.data">
            <div class="col-12 col-md-6">
            <img class="img-fluid rounded apple-shadow apple-hover" :src="`https://placehold.co/600x400/ffffff/000000?font=lora&text=${encodeURIComponent(product.data.name)}`"/>
            </div>
            <div class="col-12 col-md-6">
                <div class="d-flex">
                    <h1 class="mb-3">{{ product.data.name }}</h1>
                </div>
                <p class="mb-3">
                    {{ product.data.description }}
                </p>
                <p class="fw-semibold">Price: &#8369;{{ product.data.price.toLocaleString() }}</p>

                <div class="mb-2">
                	<label for="quantity" class="form-label">Quantity:</label>
                	<div class="input-group input-group-sm" style="width: 110px;">
                      <button
                        class="btn btn-success"
                        type="button"
                        @click="quantity = Math.max(1, quantity - 1)"
                        :disabled="quantity <= 1"
                      >-</button>

                      <input
                        type="number"
                        class="form-control text-center"
                        id="quantity"
                        v-model.number="quantity"
                        min="1"
                        style="max-width: 50px;"
                        @input="validateQuantity"
                      />
                      <button
                        class="btn btn-success"
                        type="button"
                        @click="quantity++"
                      >+</button>
                    </div>
            		<router-link 
                      to="/login" 
                      class="btn btn-outline-success btn-sm mt-2 d-inline-flex align-items-center gap-1" 
                      type="button" 
                      v-if="!user.email">
                      <i class="bi bi-box-arrow-in-right"></i>
                      <i class="bi bi-cart"></i>
                      <span>Login to Add</span>
                    </router-link>
                   <button 
                      class="btn btn-sm btn-success my-3 d-inline-flex align-items-center gap-1" 
                      v-else 
                      @click="addToCart"
                    >
                      <i class="bi bi-cart-plus"></i>
                      <span>Add to Cart</span>
                    </button>
                	</div>
            </div>
        </div>

        <div class="text-center my-5" v-if="!product.data">
            <div class="spinner-grow"></div>
        </div>
    </div>
</template>

<style scoped>
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
input[type=number] {
    -moz-appearance: textfield;
    appearance: textfield;
}

.apple-shadow {
    box-shadow:
      0 10px 15px rgba(0, 0, 0, 0.08),
      0 4px 6px rgba(0, 0, 0, 0.06);
    border-radius: 16px;
    transition: box-shadow 0.3s ease, transform 0.2s ease;
    border: none;
}

.apple-hover:hover {
    box-shadow:
      0 20px 30px rgba(0, 0, 0, 0.1),
      0 8px 15px rgba(0, 0, 0, 0.08);
}
</style>
