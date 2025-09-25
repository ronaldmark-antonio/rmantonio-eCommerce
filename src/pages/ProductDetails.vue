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
                <img
                    class="img-fluid rounded"
                    :src="`https://placehold.co/600x400/377399/ffffff?font=lora&text=${encodeURIComponent(
                        product.data.name
                    )}`"
                />
            </div>
            <div class="col-12 col-md-6">
                <div class="d-flex">
                    <h1 class="mb-3">{{ product.data.name }}</h1>
                </div>
                <p class="mb-3">
                    {{ product.data.description }}
                </p>
                <p class="fw-semibold text-primary">Price: &#8369;{{ product.data.price.toLocaleString() }}</p>

                <div class="mb-2">
                	<label for="quantity" class="form-label">Quantity:</label>
                	<div class="input-group" style="width: 150px;">
                		<button class="btn btn-primary" type="button" @click="quantity--" :disabled="quantity <= 1">-</button>
                			<input
                			type="number"
                			class="form-control text-center"
                			id="quantity"
                			v-model="quantity"
                			min="1" 
                			/>
                			<button class="btn btn-primary" type="button" @click="quantity++">+</button>
                		</div>

                		<router-link to="/login" class="btn btn-outline-success mt-4" type="button" v-if="!user.email">Login to Add to cart</router-link>
                        <button class="btn btn-sm btn-success my-3" v-else @click="addToCart">Add to Cart</button>
                	</div>
            </div>
        </div>

        <div class="text-center my-5" v-if="!product.data">
            <div class="spinner-grow"></div>
        </div>
    </div>
</template>
