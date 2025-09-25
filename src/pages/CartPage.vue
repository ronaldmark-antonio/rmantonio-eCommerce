<script setup>
  import { onBeforeMount, reactive, ref } from 'vue';
  import { useGlobalStore } from '../stores/global';
  import api from '@/api';
  import { Notyf } from 'notyf';


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
      notyf.success("Cart updated!")
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
          <td>
          <input
            type="number"
            min="1"
            v-model.number="product.quantity"
            @blur="() => {if (!product.quantity || product.quantity < 1) product.quantity = 1}"
            class="form-control form-control-sm">
          </td>
          <td>&#8369;{{ product.price * product.quantity }}</td>
          <td>
            <button class="btn btn-sm btn-danger w-100" @click="removeProduct(product._id)">
              Remove
            </button>
          </td>
        </tr>
        <tr>
          <td colspan="3"><button class="btn btn-sm btn-success" @click="checkoutAll">Checkout</button></td>
          <td colspan="2"><h4>Total: &#8369;{{ getTotal() }} {{ hasEdits()? " (unsaved)":"" }}</h4></td>
        </tr>
      </tbody>
    </table>
    <button v-if="hasEdits()" class="btn btn-sm btn-success mx-2" @click="updateCart">Update Cart</button>
    <button class="btn btn-sm btn-danger" @click="clearCart">Clear Cart</button>
  </div>
  <div v-else>
    Were you planning to shop on company time? Get back to work admin!
  </div>
</template>