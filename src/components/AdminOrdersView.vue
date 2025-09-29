<script setup>
import { onBeforeMount, ref, watch } from 'vue'
import { useGlobalStore } from '../stores/global.js';
import { useRouter } from 'vue-router'
import api from '../api'

const rawData = ref([])
const ordersData = ref([])
const groupedByUser = ref({})
const groupedByDate = ref({})
const loading = ref(false)
const productTable = ref({})
const groupBy = ref("user")

const router = useRouter()
const {user} = useGlobalStore();

function formatDate(dateString) {
  const date = new Date(dateString)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)
  return `${mm}-${dd}-${yy}`
}

async function getProductName(productId) {
  if (!productTable.value[productId]) {
    try {
      const res = await api.get(`/products/${productId}`)
      if (res.status === 200) {
        productTable.value[productId] = res.data.name
      }
    } catch (error) {
      console.error(`Error fetching product ${productId}`, error)
      productTable.value[productId] = 'Unknown Product'
    }
  }
}

function groupOrders() {
  rawData.value.forEach((order) => {
    const orderDate = formatDate(order.orderedOn)
    const orderContents = {
      productsOrdered: order.productsOrdered,
      totalPrice: order.totalPrice,
      status: order.status
    }

    groupedByUser.value[order.userId] ??= {}
    groupedByUser.value[order.userId][orderDate] ??= []
    groupedByUser.value[order.userId][orderDate].push(orderContents)

    groupedByDate.value[orderDate] ??= {}
    groupedByDate.value[orderDate][order.userId] ??= []
    groupedByDate.value[orderDate][order.userId].push(orderContents)
  })
}

onBeforeMount(async () => {

  if (!user.email) {
    return router.replace("/login");
  }

  loading.value = true
  try {
    const res = await api.get("/orders/all-orders")
    if (res.status === 200) {
      rawData.value = res.data

      // Preload product names
      res.data.forEach((order) => {
        order.productsOrdered.forEach((product) =>
          getProductName(product.productId)
        )
      })

      groupOrders()
      ordersData.value = groupedByUser.value
    }
  } catch (error) {
    if (error.response?.status === 401) {
      router.push('/login')
    } else {
      console.error(error)
    }
  } finally {
    loading.value = false
  }
})

watch(groupBy, () => {
  ordersData.value =
    groupBy.value === "user" ? groupedByUser.value : groupedByDate.value
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
    <div class="row">
      <div class="col d-flex justify-content-end align-items-center">
        <span class=" mx-2">Group By: </span>
        <div class="btn-group" role="group">
          <input type="radio" class="btn-check" name="btnradio" id="groupBy1" value="user" v-model="groupBy" autocomplete="off" checked>
          <label class="btn btn-outline-success" for="groupBy1">User</label>

          <input type="radio" class="btn-check" name="btnradio" id="groupBy2" value="date" v-model="groupBy" autocomplete="off">
          <label class="btn btn-outline-success" for="groupBy2">Date</label>
        </div>
      </div>
    </div>
    <p class="text-center" v-if="Object.keys(ordersData).length === 0">
      No orders have been placed yet.
    </p>

    <div class="row" v-else>
    <div class="col">


      <div class="accordion accordion-item my-3" id="outer-accordion">
        <div class="accordion-item" v-for="(subgroups, group) in ordersData" :key="group">
          <h2 class="accordion-header" :id="`heading-${group}`">
            <button class="accordion-button bg-white text-dark collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#group-${group}`" data-bs-parent="#outer-accordion" aria-expanded="false">
              {{ group }} (Click for Details)
            </button>
          </h2>

          <div :id="`group-${group}`" class="accordion-collapse collapse">

            <!-- INNER ACCORDION -->
            <div class="accordion" v-for="(orders, subgroup) in subgroups" :key="subgroup" :id="`accordion-${group}-${subgroup}`">
              <div class="accordion-item">
                <h2 class="accordion-header" :id="`heading-${group}-${subgroup}`">
                  <button class="accordion-button bg-white text-dark" type="button" data-bs-toggle="collapse" :data-bs-target="`#${group}-${subgroup}`" :data-bs-parent="`#accordion-${group}-${subgroup}`" aria-expanded="true">
                    {{ subgroup }} (Click for Details)
                  </button>
                </h2>
                <div
                  :id="`${group}-${subgroup}`"
                  class="accordion-collapse collapse"
                >
                  <div class="accordion-body ">
                    <ol>
                      <li v-for="order in orders">
                        Total Price: &#8369;{{ order.totalPrice.toLocaleString() }}
                        <ul>
                          <li v-for="product in order.productsOrdered">
                            {{ productTable[product.productId] || "Loading..." }} (&#8369;{{ (product.subtotal / product.quantity).toLocaleString() }}) - Quantity: {{ product.quantity }}
                          </li>
                        </ul>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</div>
</template>
