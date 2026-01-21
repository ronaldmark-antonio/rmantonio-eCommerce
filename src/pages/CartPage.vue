<script setup>
import { onBeforeMount, reactive, ref } from 'vue';
import { useGlobalStore } from '../stores/global';
import api from '@/api';
import { Notyf } from 'notyf';
import { useRouter } from 'vue-router';

const loading = ref(true); // initial fetch loading
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

// load product details from API
async function loadProducts(cartItems) {
  const results = await Promise.all(
    cartItems.map(async (product) => {
      const res = await api.get(`https://rmantonio-ecommerceapi.onrender.com/products/${product.productId}`);
      return {
        _id: product.productId,
        name: res.data.name,
        price: res.data.price,
        quantity: product.quantity,
        subtotal: product.subtotal,
      };
    })
  );

  productData.value = results;
}

// compute total dynamically
const getTotal = () => {
  return productData.value.reduce((total, product) => {
    total += product.quantity * product.price;
    return total;
  }, 0);
}

// update quantity without disabling buttons
async function updateCart(productId, newQuantity) {
  const product = productData.value.find(p => p._id === productId);
  if (product) {
    product.quantity = newQuantity; // immediate update in UI
  }

  try {
    await api.patch("https://rmantonio-ecommerceapi.onrender.com/cart/update-cart-quantity", {
      productId,
      newQuantity
    });
  } catch (error) {
    notyf.error("Server error");
    console.error(error);
  }
}

// remove product
async function removeProduct(productId) {
  if (!confirm("Do you really want to remove this product?")) return;

  try {
    await api.patch(`https://rmantonio-ecommerceapi.onrender.com/cart/${productId}/remove-from-cart`);

    // Remove product from UI
    productData.value = productData.value.filter(product => product._id !== productId);

    // Show empty cart message if no products left
    if (productData.value.length === 0) {
      noCart.value = true;
    }

    notyf.success("Product(s) removed from cart");
  } catch (error) {
    console.error("Failed to remove product:", error);
    notyf.error("Failed to remove product");
  }
}

// clear cart
async function clearCart() {
  if (!confirm("Do you really want to clear your cart?")) return;

  try {
    await api.put('https://rmantonio-ecommerceapi.onrender.com/cart/clear-cart');
    productData.value = [];
    noCart.value = true; // ensure empty cart message shows
    notyf.success("Cart cleared successfully");
  } catch (error) {
    console.error("Failed to clear cart:", error);
    notyf.error("Failed to clear cart");
  }
}


// checkout
async function checkoutCart() {
  if (!confirm("Do you want to checkout your cart?")) return;

  loading.value = true;
  try {
    const res = await api.post("https://rmantonio-ecommerceapi.onrender.com/orders/checkout");
    if (res.status === 201) {
      await api.put('https://rmantonio-ecommerceapi.onrender.com/cart/clear-cart');
      productData.value = [];
      notyf.success("Cart checked out successfully");
      router.push("/");
    }
  } catch (error) {
    notyf.error("Error in checking out.");
  } finally {
    loading.value = false;
  }
}

// fetch cart on mount
onBeforeMount(async () => {
  if (!user.token || !user.email) {
    return router.replace("/login");
  }

  try {
    const res = await api.get("https://rmantonio-ecommerceapi.onrender.com/cart/get-cart");
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
      <h1 class="text-center">
        <i class="bi bi-cart text-success me-1"></i> Your Shopping Cart
      </h1>
      <p class="text-center mb-3 pb-1">
        You’re almost there! Checkout now for exclusive deals.
      </p>

      <!-- Loading spinner for initial fetch only -->
      <div class="text-center my-5" v-if="loading">
        <div class="spinner-grow"></div>
      </div>

      <!-- Empty cart message -->
      <p class="text-center text-muted" v-else-if="productData.length === 0 || noCart">
        Your cart is empty. Products you add to your cart will appear here.
      </p>

      <!-- DESKTOP TABLE -->
       <table 
        class="table table-bordered d-none d-md-table" 
        v-if="productData.length > 0"
      >
        <thead class="table-primary">
          <tr>
            <th class="bg-dark text-white" style="width: 40%;">Name</th>
            <th class="bg-dark text-white" style="width: 15%;">Price</th>
            <th class="bg-dark text-white" style="width: 15%;">Quantity</th>
            <th class="bg-dark text-white" style="width: 15%;">Subtotal</th>
            <th class="bg-dark text-white" style="width: 15%;">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in productData" :key="product._id">
            <td>
              <router-link class="routerLink" :to="`/products/${product._id}`">{{ product.name }}</router-link>
            </td>
            <td>&#8369;{{ product.price.toLocaleString() }}</td>
            <td>
              <div class="input-group input-group-sm" style="width: 110px;">
                <button
                  class="btn btn-success"
                  @click="product.quantity--; updateCart(product._id, product.quantity)"
                  :disabled="product.quantity <= 1"
                >-</button>

                <input
                  type="number"
                  class="form-control text-center"
                  v-model.number="product.quantity"
                  min="1"
                  style="max-width: 50px;"
                  @keydown.prevent
                  @paste.prevent
                />

                <button
                  class="btn btn-success"
                  @click="product.quantity++; updateCart(product._id, product.quantity)"
                >+</button>
              </div>
            </td>
            <td>&#8369;{{ (product.price * product.quantity).toLocaleString() }}</td>
            <td>
              <button class="btn btn-sm btn-danger w-100" @click="removeProduct(product._id)">Remove</button>
            </td>
          </tr>

                    <tr class="total-row border-0">
            <td colspan="3" class="border-0">
              <div class="d-flex gap-2">
                <button 
                  class="btn btn-sm btn-danger" 
                  v-if="!loading && productData.length > 0" 
                  @click="clearCart">
                  Clear Cart
                </button>
                <button class="btn btn-sm btn-success" @click="checkoutCart">
                  Checkout
                </button>
              </div>
            </td>

            <td colspan="2" class="border-0">
              <h5>Total: &#8369;{{ getTotal().toLocaleString() }}</h5>
            </td>
          </tr>
          
        </tbody>
      </table>

      <!-- MOBILE VIEW -->
      <div class="d-md-none" v-for="product in productData" :key="product._id">
        <div class="card mb-3 apple-shadow">
          <div class="card-body">
            <h6 class="fw-bold">
              <router-link :to="`/products/${product._id}`">{{ product.name }}</router-link>
            </h6>
            <p class="mb-1">Price: ₱{{ product.price.toLocaleString() }}</p>

            <div class="d-flex align-items-center mb-2">
              <p class="me-2 mb-0">Quantity:</p>
              <div class="input-group input-group-sm" style="width: 80px;">
              <button class="btn btn-success p-1"
                      @click="product.quantity--; updateCart(product._id, product.quantity)"
                      :disabled="product.quantity <= 1">−</button>

                <input
                  type="number"
                  class="form-control text-center p-1"
                  v-model.number="product.quantity"
                  min="1"
                  style="font-size: 0.8rem; max-width: 35px;"
                  @keydown.prevent
                  @paste.prevent
                />

                <button class="btn btn-success p-1"
                       @click="product.quantity++; updateCart(product._id, product.quantity)">+</button>
              </div>
            </div>

            <p>Subtotal: ₱{{ (product.price * product.quantity).toLocaleString() }}</p>

            <button class="btn btn-danger btn-sm w-100" @click="removeProduct(product._id)">Remove</button>
          </div>
        </div>
      </div>

      <!-- MOBILE TOTAL AND ACTIONS -->
      <div class="d-md-none mt-3" v-if="productData.length">
        <h5 class="text-center mb-3">Total: ₱{{ getTotal().toLocaleString() }}</h5>
        <button class="btn btn-success w-100 mb-2" @click="checkoutCart">Checkout</button>
        <button class="btn btn-danger w-100" @click="clearCart">Clear Cart</button>
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

@media (min-width: 768px) {
  table.table td:nth-child(1),
  table.table th:nth-child(1) {
    width: 40%; /* Name column wider */
  }

  table.table td:nth-child(2),
  table.table td:nth-child(3),
  table.table td:nth-child(4),
  table.table td:nth-child(5),
  table.table th:nth-child(2),
  table.table th:nth-child(3),
  table.table th:nth-child(4),
  table.table th:nth-child(5) {
    width: 15%; /* other columns narrower */
  }
}

/* MOBILE RESPONSIVE TABLE */
@media (max-width: 768px) {
  .responsive-table thead {
    display: none;
  }

  .responsive-table,
  .responsive-table tbody,
  .responsive-table tr,
  .responsive-table td {
    display: block;
    width: 100%;
  }

  .responsive-table tr {
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 0.75rem;
    background: #fff;
  }

  .responsive-table td {
    text-align: right;
    padding-left: 50%;
    position: relative;
    border: none;
  }

  .responsive-table td::before {
    content: attr(data-label);
    position: absolute;
    left: 0;
    width: 45%;
    padding-left: 0.75rem;
    font-weight: 600;
    text-align: left;
    color: #555;
  }

  /* Mobile quantity field smaller */
  .responsive-table .input-group {
    width: 70px;        /* smaller than desktop */
    margin-left: auto;
  }

  .responsive-table .input-group input[type="number"] {
    max-width: 35px;    /* smaller input for mobile */
    font-size: 0.8rem;  /* tiny font */
    padding: 2px;
  }

  .responsive-table .input-group .btn {
    font-size: 0.8rem;  /* smaller buttons */
    padding: 0.25rem 0.35rem;
  }

  .total-row {
    border: none !important;
    background: transparent !important;
  }
}


</style>