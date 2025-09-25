<script setup>
  import { onBeforeMount, reactive, ref } from 'vue';
  import { useGlobalStore } from '../stores/global';
  import api from '@/api';


  const { user } = useGlobalStore();
  const cart = reactive({
    userId: "",
    cartItems: [],
    totalPrice: 0
  });
  const productData = ref([]);

  async function loadProducts(cartItems) {
    const results = await Promise.all(
        cartItems.map(async (product) => {
          let res = await api.get(`/products/${product.productId}`);
          return {
            _id: product.productId,
            name: res.data.name,
            price: res.data.price,
            quantity: product.quantity,
            subtotal: product.subtotal,
          }
        })
      );

    productData.value = results;
    console.log(productData.value);
  }

  onBeforeMount(async () => {
    if (!user.isAdmin) {
      try {
        let res = await api.get("/cart/get-cart");
        cart.userId = res.data.cart.userId;
        cart.cartItems = res.data.cart.cartItems;
        cart.totalPrice = res.data.cart.totalPrice;

        loadProducts(cart.cartItems)
      } catch (err) {
        console.error(err);
      }
    }
  });
</script>

<template>
  <div v-if="!user.isAdmin" class="container my-5">
    <h1 class="text-center mb-4">Your Shopping Cart</h1>
    <table class="table table-bordered">
      <thead class="table-primary">
        <tr>
          <th style="width: 200px;">Name</th>
          <th style="width: 200px;">Price</th>
          <th style="width: 50px;">Quantity</th>
          <th style="width: 130px;">Subtotal</th>
          <th style="width: 130px;">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in productData" :key="product._id">
          <td class="text-start">{{ product.name }}</td>
          <td class="text-start">&#8369;{{ product.price.toLocaleString() }}</td>
          <td>{{ product.quantity }}</td>
          <td>&#8369;{{ product.subtotal.toLocaleString() }}</td>
          <td>
            <button class="btn btn-sm btn-danger w-100" @click="removeProduct(product._id)">
              Remove
            </button>
          </td>
        </tr>
        <tr>
          <td colspan="3"><button class="btn btn-sm btn-success" @click="checkoutAll">Checkout</button></td>
          <td colspan="2"><p>?</p></td>
        </tr>
      </tbody>
    </table>

     <button  v-if="productData.length !== 0" class="btn btn-sm btn-danger" @click="clearCart">Clear Cart</button>
  </div>
</template>