<script setup>
import { onBeforeMount, reactive, ref } from 'vue';
import { useGlobalStore } from '../stores/global';
import api from '@/api';
import { Notyf } from 'notyf';

const loading = ref(true);
const { user } = useGlobalStore();
const notyf = new Notyf
const cart = reactive({
  userId: "",
  cartItems: [],
  totalPrice: 0
});
const productData = ref([]);
const originalQuantities = ref({});

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
  originalQuantities.value = results.reduce((entries, product) => {
      entries[product._id] = product.quantity;
      return entries;
    }, {}
  );
}

const getTotal = () => {
  return productData.value.reduce((total, product) => {
    total += product.quantity * product.price;
    return total;
  }, 0)
}

const hasEdits = () => {
  return productData.value.some(
    (product) => product.quantity !== originalQuantities.value[product._id]
  );
}

async function updateCart() {
  try {
    let updatedProducts = productData.value.filter((product) => product.quantity !== originalQuantities.value[product._id])
    updatedProducts.forEach(async (product) => {
      await api.patch("/cart/update-cart-quantity", {
        productId: product._id,
        newQuantity: product.quantity
      });
    });

    originalQuantities.value = productData.value.reduce((entries, product) => {
        entries[product._id] = product.quantity;
        return entries;
      }, {}
    );
    notyf.success("Cart Updated!")
  } catch (error) {
    notyf.error("Server error")
    console.error(error)
  }
}

onBeforeMount(async () => {
  if (!user.isAdmin) {
    try {
      let res = await api.get("/cart/get-cart");
      cart.userId = res.data.cart.userId;
      cart.cartItems = res.data.cart.cartItems;
      cart.totalPrice = res.data.cart.totalPrice;

      await loadProducts(cart.cartItems);
    } catch (err) {
      console.error(err);
    } finally {
    loading.value = false;
  }
  }
});
</script>

<template>
  <div v-if="!user.isAdmin" class="container my-5">
    <h1 class="text-center mb-4">Your Shopping Cart</h1>
    <p class="text-center" v-if="!loading && productData.length === 0">Your cart is empty. Please Add to cart in our products</p>
    <table class="table table-bordered" v-else-if="!loading && productData.length > 0">
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
          <td>
            <div class="input-group input-group-sm" style="width: 110px;">
              <button
              class="btn btn-dark"
              type="button"
              @click="product.quantity = Math.max(1, product.quantity - 1)"
              :disabled="product.quantity <= 1"
              >-</button>
              <input
              type="number"
              class="form-control text-center"
              v-model.number="product.quantity"
              min="1"
              style="max-width: 50px;"
              />
              <button
              class="btn btn-dark"
              type="button"
              @click="product.quantity++"
              >+</button>
            </div>
          </td>
          <td>&#8369;{{ (product.price * product.quantity).toLocaleString() }}</td>
          <td>
            <button class="btn btn-sm btn-danger w-100" @click="removeProduct(product._id)">Remove</button>
          </td>
        </tr>
        <tr>
          <td colspan="3">
            <button class="btn btn-sm btn-success" @click="checkoutAll">Checkout</button>
             <button v-if="hasEdits()" class="btn btn-sm btn-success mx-2" @click="updateCart">Update Cart</button>
          </td>
          <td colspan="2">
            <h4>Total: &#8369;{{ getTotal().toLocaleString() }}{{ hasEdits() ? " (unsaved)" : "" }}</h4>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!loading && productData.length > 0">
      <button class="btn btn-sm btn-danger" @click="clearCart">Clear Cart</button>
    </div>
  </div>
</template>

<style>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>