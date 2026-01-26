<script setup>
import { onBeforeMount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notyf } from "notyf";
import api from "../api";
import { useGlobalStore } from "../stores/global";

const route = useRoute();
const router = useRouter();
const notyf = new Notyf();
const { user } = useGlobalStore();

const name = ref("");
const description = ref("");
const price = ref(0);
const formattedPrice = ref("");
const updateEnabled = ref(false);
const isSubmitting = ref(false);
const isCanceling = ref(false);

// Original product data to compare changes
let originalProduct = {
  name: "",
  description: "",
  price: 0,
};

// Normalize name for duplicate check
function normalizeName(value) {
  return value.toLowerCase().replace(/[\s\-_]+/g, "").trim();
}

// Format price with commas
function formatPrice() {
  const digits = formattedPrice.value.replace(/[^\d]/g, "");
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  formattedPrice.value = withCommas;
  price.value = parseInt(digits) || 0;
}

// Enable button only if something changed AND all fields are filled
watch([name, description, price], ([n, d, p]) => {
  const somethingChanged =
    normalizeName(n) !== normalizeName(originalProduct.name) ||
    d.trim() !== originalProduct.description ||
    p !== originalProduct.price;

  const allFilled = n.trim() !== "" && d.trim() !== "" && p > 0;

  updateEnabled.value = somethingChanged && allFilled;
});

// Load product
onBeforeMount(async () => {
  if (!user.token) {
    router.push("/login");
    return;
  }

  try {
    const { data } = await api.get(
      `https://rmantonio-ecommerceapi.onrender.com/products/${route.params.productId}`
    );

    name.value = data.name;
    description.value = data.description;
    price.value = data.price;
    formattedPrice.value = data.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    originalProduct = { ...data };

    updateEnabled.value = false;
  } catch (err) {
    notyf.error("Failed to load product. Please go back and try again.");
    router.push("/products");
  }
});

// Update product
async function handleUpdate() {
  if (!updateEnabled.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    const res = await api.patch(
      `https://rmantonio-ecommerceapi.onrender.com/products/${route.params.productId}/update`,
      {
        name: name.value.trim(),
        description: description.value,
        price: price.value,
      }
    );

    if (res.status === 200) {
      notyf.success("Product updated successfully");
      router.push("/products");
    }
  } catch (err) {
    if (err.response?.status === 409) {
      notyf.error("Another product with this name already exist");
    } else if (err.response?.status === 404) {
      notyf.error("Product not found. Please refresh the page.");
    } else {
      notyf.error(`Error updating product: ${err.response?.data?.error || err.message}`);
    }
  } finally {
    isSubmitting.value = false;
  }
}

// Cancel update
function cancelUpdate() {
  if (isCanceling.value) return;
  isCanceling.value = true;

  setTimeout(() => {
    router.push("/products");
  }, 500);
}
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
              <!-- Name -->
              <div class="form-group mb-3">
                <label for="name" class="form-label">Name:</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-tag-fill"></i></span>
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

              <!-- Description -->
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

              <!-- Price -->
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

              <!-- Buttons -->
              <div class="d-flex gap-3 mt-3">
                <!-- Submit -->
                <button
                  type="submit"
                  class="btn btn-success d-flex align-items-center justify-content-center gap-2 px-4"
                  :disabled="!updateEnabled || isSubmitting"
                >
                  <template v-if="!isSubmitting">
                    <i class="bi bi-check-circle-fill"></i>
                    <span>Submit</span>
                  </template>
                  <template v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Submitting...</span>
                  </template>
                </button>

                <!-- Cancel -->
                <button
                  type="button"
                  class="btn btn-outline-success d-flex align-items-center justify-content-center gap-2 px-4"
                  :disabled="isCanceling"
                  @click="cancelUpdate"
                >
                  <template v-if="!isCanceling">
                    <i class="bi bi-x-circle-fill me-1"></i>
                    <span>Cancel</span>
                  </template>
                  <template v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Canceling...</span>
                  </template>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

