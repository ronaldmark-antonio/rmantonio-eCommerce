<script setup>
import { onBeforeMount, reactive, ref } from 'vue';
import { useGlobalStore } from '../stores/global';
import api from '@/api';
import { Notyf } from 'notyf';
import { useRouter } from 'vue-router';

const loading = ref(true);
const { user } = useGlobalStore();
const router = useRouter();
const notyf = new Notyf();

const cart = reactive({
  userId: "",
  cartItems: [],
  totalPrice: 0
});

const productData = ref([]);
const noCart = ref(false);

async function loadProducts(cartItems) {
  const results = await Promise.all(
    cartItems.map(async (product) => {
      const res = await api.get(
        `https://rmantonio-ecommerceapi.onrender.com/products/${product.productId}`
      );
      return {
        _id: product.productId,
        name: res.data.name,
        price: res.data.price,
        quantity: product.quantity
      };
    })
  );
  productData.value = results;
}

const getTotal = () =>
  productData.value.reduce(
    (total, product) => total + product.quantity * product.price,
    0
  );

async function updateCart(productId, newQuantity) {
  try {
    await api.patch(
      "https://rmantonio-ecommerceapi.onrender.com/cart/update-cart-quantity",
      { productId, newQuantity }
    );
  } catch {
    notyf.error("Server error");
  }
}

async function removeProduct(productId) {
  if (!confirm("Do you really want to remove this product?")) return;
  try {
    await api.patch(
      `https://rmantonio-ecommerceapi.onrender.com/cart/${productId}/remove-from-cart`
    );
    productData.value = productData.value.filter(p => p._id !== productId);
    notyf.success("Product removed");
  } catch {
    notyf.error("Failed to remove product");
  }
}

async function clearCart() {
  if (!confirm("Do you really want to clear your cart?")) return;
  try {
    await api.put("https://rmantonio-ecommerceapi.onrender.com/cart/clear-cart");
    productData.value = [];
    notyf.success("Cart cleared");
  } catch {
    notyf.error("Failed to clear cart");
  }
}

async function checkoutCart() {
  if (!confirm("Do you want to checkout your cart?")) return;
  try {
    const res = await api.post(
      "https://rmantonio-ecommerceapi.onrender.com/orders/checkout"
    );
    if (res.status === 201) {
      await clearCart();
      router.push("/");
      notyf.success("Checkout successful");
    }
  } catch {
    notyf.error("Checkout failed");
  }
}

onBeforeMount(async () => {
  if (!user.token || !user.email) return router.replace("/login");

  try {
    const res = await api.get(
      "https://rmantonio-ecommerceapi.onrender.com/cart/get-cart"
    );
    cart.cartItems = res.data.cart.cartItems;
    await loadProducts(cart.cartItems);
  } catch (err) {
    if (err.response?.status === 404) noCart.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="!user.isAdmin" class="container my-5">
    <div class="apple-shadow apple-hover p-4 rounded-4">
      <h1 class="text-center">
        <i class="bi bi-cart text-success me-1"></i> Your Shopping Cart
      </h1>

      <p class="text-center mb-3 pb-1">
        You’re almost there! Checkout now for exclusive deals.
      </p>

      <div class="text-center my-5" v-if="loading">
        <div class="spinner-grow"></div>
      </div>

      <p v-else-if="productData.length === 0 || noCart" class="text-center text-muted">
        Your cart is empty.
      </p>

      <table v-else class="table table-bordered cart-table">
        <thead class="table-primary">
          <tr>
            <th class="bg-dark text-white">Name</th>
            <th class="bg-dark text-white">Price</th>
            <th class="bg-dark text-white">Quantity</th>
            <th class="bg-dark text-white">Subtotal</th>
            <th class="bg-dark text-white">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="product in productData" :key="product._id">
            <td data-label="Name">
              <router-link :to="`/products/${product._id}`">
                {{ product.name }}
              </router-link>
            </td>

            <td data-label="Price">
              ₱{{ product.price.toLocaleString() }}
            </td>

            <td data-label="Quantity">
              <div class="input-group input-group-sm qty-group" style="width:110px;">
                <button
                  class="btn btn-success"
                  @click="product.quantity--; updateCart(product._id, product.quantity)"
                  :disabled="product.quantity <= 1"
                >−</button>

                <input
                  type="number"
                  class="form-control text-center"
                  v-model.number="product.quantity"
                  min="1"
                />

                <button
                  class="btn btn-success"
                  @click="product.quantity++; updateCart(product._id, product.quantity)"
                >+</button>
              </div>
            </td>

            <td data-label="Subtotal">
              ₱{{ (product.price * product.quantity).toLocaleString() }}
            </td>

            <td data-label="Action">
              <button class="btn btn-sm btn-danger w-100" @click="removeProduct(product._id)">
                Remove
              </button>
            </td>
          </tr>

          <tr>
            <td colspan="3">
              <button class="btn btn-sm btn-success" @click="checkoutCart">
                Checkout
              </button>
            </td>
            <td colspan="2">
              <h4>Total: ₱{{ getTotal().toLocaleString() }}</h4>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && productData.length">
        <button class="btn btn-sm btn-danger" @click="clearCart">
          Clear Cart
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* remove number arrows */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}
input[type="number"] {
  appearance: textfield;
}

/* ================= MOBILE ONLY ================= */
@media (max-width: 768px) {
  .cart-table thead {
    display: none;
  }

  .cart-table,
  .cart-table tbody,
  .cart-table tr,
  .cart-table td {
    display: block;
    width: 100%;
  }

  .cart-table tr {
    background: #fff;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
  }

  .cart-table td {
    border: none;
    padding-left: 50%;
    text-align: right;
    position: relative;
  }

  .cart-table td::before {
    content: attr(data-label);
    position: absolute;
    left: 1rem;
    font-weight: 600;
    text-align: left;
  }

  .qty-group {
    justify-content: flex-end;
  }
}
</style>
