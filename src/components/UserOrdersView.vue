<script setup>
  import { onBeforeMount, ref } from 'vue';

  import api from '../api';

  const ordersData = ref([]);
  const loading = ref(false);
  const productTable = ref({});

  async function getProductName(productId) {
    let productName = productTable.value[productId];
    if (!productName) {
      try {
        let res = await api.get(`/products/${productId}`);
        if (res.status === 200) {
          productName = res.data.name;
          productTable.value[productId] = productName;
        }
      } catch (error) {
        console.error(`Error in fetching product ${productId}`, error);
      }
    }
  }

	onBeforeMount(async () => {
    loading.value = true;
    try {
      let res = await api.get("/orders/my-orders");
      if (res.status === 200) {
        ordersData.value = res.data.orders;
        res.data.orders.forEach((order) => {
          order.productsOrdered.forEach((product) => getProductName(product.productId))
        })
      }
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  })
</script>

<template>
<div class="container my-5">
  <div class="text-center my-5" v-if="loading">
    <div class="spinner-grow"></div>
  </div>
  <div class="apple-shadow apple-hover p-4 rounded-4" v-else>
    <h1 class="text-center mb-4">
      <i class="bi bi-receipt me-1"></i> Order History
    </h1>
    <p class="text-center" v-if="ordersData.length === 0">
      You have not placed any orders yet.
    </p>

    <div class="accordion" v-for="(order, orderNum) in ordersData" :key="order._id">
      <div class="accordion-item">
        <h2 class="accordion-header" :id="`product-heading-${orderNum + 1}`">
          <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="`#product-${orderNum + 1}`" aria-expanded="true">
            Order #{{ orderNum + 1 }} - Purchased on: {{ order.orderedOn.split("T")[0] }}
          </button>
        </h2>
        <div
          :id="`product-${orderNum + 1}`"
          :class="{
            'accordion-collapse': true,
            'collapse': true,
            'show': orderNum + 1 === ordersData.length
          }"
        >
          <div class="accordion-body">
            <ul>
              <li v-for="product in order.productsOrdered">
                  {{ productTable[product.productId] || "Loading..." }} (&#8369;{{ (product.subtotal / product.quantity).toLocaleString() }}) - Qty: {{ product.quantity }}</li>
            </ul>
            <h5>Total: &#8369;{{ order.totalPrice.toLocaleString() }}</h5>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
