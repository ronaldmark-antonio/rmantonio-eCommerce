<script setup>
    import { onBeforeMount, reactive } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import api from "../api";

    import { useGlobalStore } from "../stores/global";
    import { Notyf } from "notyf";
    import { ref } from 'vue';

    import { computed } from 'vue';

    const quantity = ref(1);
    const notyf = new Notyf();
    const router = useRouter()
    const { user } = useGlobalStore();
    const loading = ref(false);

    const product = reactive({ data: null });


    const subtotal = computed(() => {
      if (!product.data) return 0;
      return product.data.price * quantity.value;
    });

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

    loading.value = true;
    try {
        await api.post('/cart/add-to-cart', payload);
        notyf.success("Added to Cart.");
    } catch (error) {
        console.error("Fetch error:", error);
        notyf.error("Server error: Failed to Add to Cart.");
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
            <i class="bi bi-box-seam"></i> Products
        </router-link>
    </li>
    <li class="breadcrumb-item active text-dark" aria-current="page">
      <i class="bi bi-tag"></i>
      {{ product.data ? product.data.name : "Loading..." }}
  </li>
</ol>
</nav>

<div class="text-center my-5" v-if="loading">
    <div class="spinner-grow"></div>
</div>
<div class="row mx-auto my-3 gap-4 gap-md-0" v-else-if="product.data">
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
        <p class="fw-semibold">
          Price: &#8369;{{ product.data.price.toLocaleString() }}
          <span class="text-muted">× {{ quantity }} =</span>
          <span class="text-success">&#8369;{{ subtotal.toLocaleString() }}</span>
      </p>


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
</style>
