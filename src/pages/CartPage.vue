<script setup>
import { onBeforeMount, reactive, ref, watch } from 'vue';
import { useGlobalStore } from '../stores/global';
import api from '@/api';
import { Notyf } from 'notyf';
import { useRouter } from 'vue-router';

const loading = ref(true);
const { user } = useGlobalStore();
const router = useRouter();

const notyf = new Notyf
const cart = reactive({
  userId: "",
  cartItems: [],
  totalPrice: 0
});
const productData = ref([]);
const noCart = ref(false)

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
}

const getTotal = () => {
  return productData.value.reduce((total, product) => {
    total += product.quantity * product.price;
    return total;
  }, 0)
}

async function updateCart(productId, newQuantity) {
  loading.value = true;
  try {
    await api.patch("/cart/update-cart-quantity", {
        productId: productId,
        newQuantity: newQuantity
      });
  } catch (error) {
    notyf.error("Server error")
    console.error(error)
  } finally {
    loading.value = false;
  }
}

async function removeProduct(productId) {
  if (confirm("Do you really want to remove this product?")) {
    loading.value = true;
    try {
      await api.patch(`/cart/${productId}/remove-from-cart`);

      productData.value = productData.value.filter(product => product._id !== productId);

      notyf.success("Product removed from cart");
    } catch (error) {
      console.error("Failed to remove product:", error);
      notyf.error("Failed to remove product");
    } finally {
      loading.value = false;
    }
  }
}

async function clearCart() {
if (confirm("Do you really want to clear your cart?")) {
  loading.value = true;
  try {
    await api.put('/cart/clear-cart');

    productData.value = [];

    notyf.success("Cart cleared");
  } catch (error) {
    console.error("Failed to clear cart:", error);
    notyf.error("Failed to clear cart");
  } finally {
    loading.value = false;
  }
}
}

async function checkoutCart() {
  if (confirm("Do you want to checkout your cart?")) {
    loading.value = true
    try {
      let res = await api.post("/orders/checkout");
      if (res.status === 201) {
        await api.put('/cart/clear-cart');
        productData.value = [];

        notyf.success("Cart successfully checked out!");
        router.push("/");
      }
    } catch (error) {
      notyf.error("Error in checking out.");
    } finally {
      loading.value = false;
    }
  }
}

onBeforeMount(async () => {
  if (!user.token || !user.email) {
    return router.replace("/login");
  }

  try {
    const res = await api.get("/cart/get-cart");
    cart.userId = res.data.cart.userId;
    cart.cartItems = res.data.cart.cartItems;
    cart.totalPrice = res.data.cart.totalPrice;

    await loadProducts(cart.cartItems);
  } catch (err) {
    if (err.response?.status === 404) {
      noCart.value = true;
    } else {
      console.error("Cart fetch error:", err);
    }
  } finally {
    loading.value = false;
  }
});

</script>

<template>
  <div v-if="!user.isAdmin" class="container my-5">
    <div class="apple-shadow apple-hover p-4 rounded-4">
      <h1 class="text-center mb-4">
        <i class="bi bi-cart me-2"></i> Your Shopping Cart
      </h1>
      <div class="text-center my-5" v-if="loading">
        <div class="spinner-grow"></div>
      </div>
      <p class="text-center" v-else-if="productData.length === 0 || noCart">
        Your cart is empty. Products you add to your cart will appear here.
      </p>

      <table class="table table-bordered" v-else>
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
            <td class="text-start"><router-link class="routerLink" :to="{ path: `/products/${product._id}` }">{{ product.name }}</router-link></td>
            <td class="text-start">&#8369;{{ product.price.toLocaleString() }}</td>
            <td>
              <div class="input-group input-group-sm" style="width: 110px;">
                <button
                  class="btn btn-success"
                  type="button"
                  @click="product.quantity -= 1;
                    updateCart(product._id, product.quantity)"
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
                  class="btn btn-success"
                  type="button"
                  @click="product.quantity++;
                    updateCart(product._id, product.quantity)"
                >+</button>
              </div>
            </td>
            <td>&#8369;{{ (product.price * product.quantity).toLocaleString() }}</td>
            <td>
              <button class="btn btn-sm btn-danger w-100" @click="removeProduct(product._id)">
                Remove
              </button>
            </td>
          </tr>

          <tr>
            <td colspan="3">
              <button class="btn btn-sm btn-success" @click="checkoutCart">Checkout</button>
            </td>
            <td colspan="2">
              <h4>Total: &#8369;{{ getTotal().toLocaleString() }} </h4>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && productData.length > 0">
        <button class="btn btn-sm btn-danger" @click="clearCart">Clear Cart</button>
      </div>
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
  appearance: textfield;
}
</style>