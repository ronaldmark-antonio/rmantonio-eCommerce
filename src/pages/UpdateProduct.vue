<script setup>
import { onBeforeMount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Notyf } from 'notyf';
import api from '../api';
import { useGlobalStore } from '../stores/global';

const route = useRoute();
const router = useRouter();
const notyf = new Notyf();
const { user } = useGlobalStore();

const name = ref('');
const description = ref('');
const price = ref(0);
const formattedPrice = ref('');
const updateEnabled = ref(false);
const allProducts = ref([]); // ✅ store all products for validation

function formatPrice() {
  let digits = formattedPrice.value.replace(/[^\d]/g, '');
  let withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  formattedPrice.value = withCommas;
  price.value = parseInt(digits) || 0;
}

watch([name, description, price], (currValue) => {
  updateEnabled.value = currValue.every(input => input);
});

// Normalize product name for duplicate checks
function normalizeName(value) {
  return value.toLowerCase().replace(/[\s\-_]+/g, '').trim();
}

async function handleUpdate() {
  // ✅ Check for duplicate names
  const normalizedNewName = normalizeName(name.value);
  const isDuplicate = allProducts.value.some(
    p =>
      normalizeName(p.name) === normalizedNewName &&
      p._id !== route.params.productId // exclude current product
  );

  if (isDuplicate) {
    notyf.error('Another product with this name already exists');
    return;
  }

  try {
    let res = await api.patch(
      `https://rmantonio-ecommerceapi.onrender.com/products/${route.params.productId}/update`,
      {
        name: name.value.trim(),
        description: description.value,
        price: price.value,
      }
    );

    if (res.status === 200) {
      notyf.success('Product updated successfully');
      router.push('/products');
    }
  } catch (err) {
    notyf.error(
      `Error in product update: ${err.response?.data?.error || err.message}`
    );
  }
}

onBeforeMount(async () => {
  if (!user.token) {
    router.push('/login');
    return;
  }

  // Fetch current product data
  const { data } = await api.get(
    `https://rmantonio-ecommerceapi.onrender.com/products/${route.params.productId}`
  );

  name.value = data.name;
  description.value = data.description;
  price.value = data.price;
  formattedPrice.value = data.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // ✅ Fetch all products for name validation
  const allData = await api.get('https://rmantonio-ecommerceapi.onrender.com/products');
  allProducts.value = allData.data;
});
</script>

<template>
  <div class="container-fluid my-5">
    <div class="row d-flex justify-content-center">
      <div class="col-md-8">
        <div class="apple-shadow p-4 rounded-3">
          <div class="card-body">
            <h3 class="card-title mb-4 text-center">
              <i class="bi bi-pencil-square me-2"></i> Update Product
            </h3>

            <form @submit.prevent="handleUpdate">
              <div class="form-group mb-3">
                <label for="name" class="form-label">Name:</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-tag-fill"></i>
                  </span>
                  <input
                    type="text"
                    id="name"
                    class="form-control"
                    v-model="name"
                    placeholder="Enter product name"
                    required
                  />
                </div>
              </div>

              <div class="form-group mb-3">
                <label for="description" class="form-label">Description:</label>
                <div class="input-group">
                  <span class="input-group-text align-items-start pt-2">
                    <i class="bi bi-card-text"></i>
                  </span>
                  <textarea
                    id="description"
                    class="form-control"
                    rows="5"
                    v-model="description"
                    placeholder="Enter product description"
                    required
                  ></textarea>
                </div>
              </div>

              <div class="form-group mb-4">
                <label for="price" class="form-label">Price:</label>
                <div class="input-group">
                  <span class="input-group-text">₱</span>
                  <input
                    type="text"
                    id="price"
                    class="form-control"
                    v-model="formattedPrice"
                    @input="formatPrice"
                    placeholder="Enter product price"
                    required
                  />
                </div>
              </div>

              <div class="d-flex gap-3 mt-3">
                <button
                  type="submit"
                  class="btn btn-success px-4"
                  :disabled="!updateEnabled"
                >
                  <i class="bi bi-pencil-square me-1"></i> Update
                </button>

                <RouterLink to="/products" class="btn btn-outline-success px-4">
                  <i class="bi bi-x-circle me-1"></i> Cancel
                </RouterLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Remove default number input arrows if type changes */
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
