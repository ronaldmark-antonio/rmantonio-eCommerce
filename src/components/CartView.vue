<script setup>
import { defineProps } from "vue";
import { useRouter } from "vue-router";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import api from "../api";

const props = defineProps({
  cartData: Array,
});

const router = useRouter();
const notyf = new Notyf();


</script>

<template>
  <div class="container my-5">
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
        <tr v-for="product in cartData" :key="product._id">
          <td class="text-start">{{ product.name }}</td>
          <td class="text-start">&#8369;{{ product.price.toLocaleString() }}</td>
          <td>{{ product.quantity }}</td>
          <td>&#8369;{{ product.subtotal }}</td>
          <td>
            <button class="btn btn-sm btn-danger w-100" @click="removeProduct(product._id)">
              Remove
            </button>
          </td>
        </tr>
          <td colspan="3"><button class="btn btn-sm btn-success" @click="checkoutAll">Checkout</button></td>
          <td colspan="2">?</td>
      </tbody>
    </table>
     <button class="btn btn-sm btn-danger" @click="clearCart">Clear Cart</button>
  </div>
</template>

