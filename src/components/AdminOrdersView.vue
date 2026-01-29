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

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  })
}

function safeId(value) {
  return value.replace(/\s|,/g, '-')
}

async function getProductName(productId) {
  if (!productTable.value[productId]) {
    try {
      const res = await api.get(`https://rmantonio-ecommerceapi.onrender.com/products/${productId}`)
      if (res.status === 200) {
        productTable.value[productId] = res.data.name
      }
    } catch (error) {
      console.error(`Error fetching product ${productId}`, error)
      productTable.value[productId] = 'Unknown Product'
    }
  }
}

const usersMap = ref({})

async function fetchUsers() {
  try {
    const res = await api.get('https://rmantonio-ecommerceapi.onrender.com/users')
    if (res.status === 200) {
      // Build a map of userId → "First Last"
      res.data.forEach(user => {
        usersMap.value[user._id] = `${user.firstName} ${user.lastName}`
      })
    }
  } catch (error) {
    console.error('Error fetching users', error)
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

    // Use the users map to get name, fallback to userId if missing
    const userName = usersMap.value[order.userId] || order.userId
    const userKey = `${userName} (${order.userId})`

    // Group by user
    groupedByUser.value[userKey] ??= {}
    groupedByUser.value[userKey][orderDate] ??= []
    groupedByUser.value[userKey][orderDate].push(orderContents)

    // Group by date
    groupedByDate.value[orderDate] ??= {}
    groupedByDate.value[orderDate][userKey] ??= []
    groupedByDate.value[orderDate][userKey].push(orderContents)
  })
}

onBeforeMount(async () => {
  if (!user.email) return router.replace("/login");

  loading.value = true
  try {
    // Fetch all users first
    await fetchUsers()

    // Fetch orders
    const res = await api.get("https://rmantonio-ecommerceapi.onrender.com/orders/all-orders")
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
    if (error.response?.status === 401) router.push('/login')
    else console.error(error)
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

    <h1 class="text-center">
      <i class="bi bi-receipt me-1 text-success"></i> Order History
    </h1>
    <p class="text-center mb-3 pb-1">
        Stay connected! Monitor your customers' orders in real-time.
    </p>
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
    <p class="text-center text-muted" v-if="Object.keys(ordersData).length === 0">
      No orders have been placed yet.
    </p>

    <div class="row" v-else>
    <div class="col">
     <div class="accordion accordion-item my-3" id="outer-accordion">
      <div
        class="accordion-item"
        v-for="(subgroups, group) in ordersData"
        :key="group"
      >
        <h2 class="accordion-header" :id="`heading-${safeId(group)}`">
          <button
            class="accordion-button bg-white text-dark collapsed fw-bold"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="`#group-${safeId(group)}`"
            data-bs-parent="#outer-accordion"
          >
            {{ group }} (click for details)
          </button>
        </h2>

        <div
          :id="`group-${safeId(group)}`"
          class="accordion-collapse collapse"
        >

            <!-- INNER ACCORDION -->
            <div
              class="accordion"
              v-for="(orders, subgroup) in subgroups"
              :key="subgroup"
              :id="`accordion-${safeId(group)}-${safeId(subgroup)}`"
            >
              <div class="accordion-item">
                <h2 class="accordion-header" :id="`heading-${safeId(group)}-${safeId(subgroup)}`">
                  <button
                    class="accordion-button bg-white text-dark"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#${safeId(group)}-${safeId(subgroup)}`"
                    :data-bs-parent="`#accordion-${safeId(group)}-${safeId(subgroup)}`"
                  >
                    {{ subgroup }} (click for details)
                  </button>
                </h2>

                <div
                  :id="`${safeId(group)}-${safeId(subgroup)}`"
                  class="accordion-collapse collapse"
                >

                  <div class="accordion-body ">
                    <ol>
                      <li v-for="order in orders">
                        Total Price: &#8369;{{ order.totalPrice.toLocaleString() }}
                        <ul>
                          <li v-for="product in order.productsOrdered">
                            {{ productTable[product.productId] || "Loading..." }} | Quantity: {{ product.quantity }} | Subtotal &#8369;{{ (product.subtotal / product.quantity).toLocaleString() }}
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
