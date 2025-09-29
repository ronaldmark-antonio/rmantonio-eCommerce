<script setup>
  import { onBeforeMount, ref, watch } from 'vue';

  import api from '../api';

  const rawData = ref([]);
  const ordersData = ref([]);
  const groupedByUser = ref({});
  const groupedByDate = ref({});
  const loading = ref(false);
  const productTable = ref({});
  const groupBy = ref("user");

function formatDate(dateString) {
  const date = new Date(dateString);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}-${dd}-${yy}`;
}

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

  function groupOrders() {
    rawData.value.forEach((order) => {
      let orderDate = formatDate(order.orderedOn);
      let orderContents = {
        productsOrdered: order.productsOrdered,
        totalPrice: order.totalPrice,
        status: order.status
      }
      groupedByUser.value[order.userId] ??= {};
      groupedByDate.value[orderDate] ??= {};

      groupedByUser.value[order.userId][orderDate] ??= [];
      groupedByDate.value[orderDate][order.userId] ??= [];

      groupedByUser.value[order.userId][orderDate].push(orderContents);
      groupedByDate.value[orderDate][order.userId].push(orderContents);
    })
  }

	onBeforeMount(async () => {
    loading.value = true;
    try {
      let res = await api.get("/orders/all-orders");
      if (res.status === 200) {
        rawData.value = res.data;
        res.data.forEach((order) => {
          order.productsOrdered.forEach((product) => getProductName(product.productId))
        });
        groupOrders();
        ordersData.value = groupedByUser.value;
      }
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  });

  watch([groupBy], (newVal, oldVal) => {
    if (groupBy.value === "user") {
      ordersData.value = groupedByUser.value;
    } else if (groupBy.value === "date") {
      ordersData.value = groupedByDate.value;
    }
    console.log(ordersData.value)
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
                  <div class="accordion-body">
                    <ol>
                      <li v-for="order in orders">
                        Total Price: &#8369;{{ order.totalPrice.toLocaleString() }}
                        <ul>
                          <li v-for="product in order.productsOrdered">
                            {{ productTable[product.productId] || "Loading..." }} (&#8369;{{ (product.subtotal / product.quantity).toLocaleString() }}) - Qty: {{ product.quantity }}
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
