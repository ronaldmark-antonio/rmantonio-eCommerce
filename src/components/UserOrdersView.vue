<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalStore } from '../stores/global.js'
import api from '../api'

const router = useRouter()
const {user} = useGlobalStore();

const ordersData = ref([])
const loading = ref(false)
const productTable = ref({})

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}-${dd}-${yy}`;
};

async function getProductName(productId) {
  if (!productTable.value[productId]) {
    try {
      let res = await api.get(`/products/${productId}`)
      if (res.status === 200) {
        productTable.value[productId] = res.data.name
      }
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error)
      productTable.value[productId] = 'Unknown Product'
    }
  }
}

onBeforeMount(async () => {

  if (!user.email) {
    return router.replace("/login");
  }

  loading.value = true
  try {
    let res = await api.get("/orders/my-orders")
    if (res.status === 200) {
      ordersData.value = res.data.orders

      res.data.orders.forEach((order) => {
        order.productsOrdered.forEach((product) =>
          getProductName(product.productId)
        )
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
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
          <button 
            class="accordion-button bg-white text-dark fw-semi-bold" 
            type="button" 
            data-bs-toggle="collapse" 
            :data-bs-target="`#product-${orderNum + 1}`" 
            aria-expanded="true"
          >
            Order #{{ orderNum + 1 }} - Purchased on: {{ formatDate(order.orderedOn) }} (Click for Details)
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
            <p>Items:</p>
            <ul>
              <li v-for="product in order.productsOrdered" :key="product.productId">
                {{ productTable[product.productId] || "Loading..." }} 
                (&#8369;{{ (product.subtotal / product.quantity).toLocaleString() }}) 
                - Quantity: {{ product.quantity }}
              </li>
            </ul>
            <h5>Total: &#8369;{{ order.totalPrice.toLocaleString() }}</h5>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
