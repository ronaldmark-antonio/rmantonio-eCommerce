<script setup>
import { onBeforeMount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import api from "../api";
import { useGlobalStore } from "../stores/global";
import { Notyf } from "notyf";

const notyf = new Notyf();
const { user } = useGlobalStore();
const router = useRouter();

const name = ref("");
const description = ref("");
const price = ref("");
const formattedPrice = ref("");
const isEnabled = ref(false);
const isSubmitting = ref(false);   // For Submit button spinner
const isCanceling = ref(false);    // For Cancel button spinner

// Enable submit only when all fields are filled
watch([name, description, price], (currentValue) => {
  isEnabled.value = currentValue.every(input => input);
});

// Redirect non-admin users
onBeforeMount(() => {
  if (!user.email || !user.isAdmin) {
    if (!localStorage.getItem('redirected')) {
      localStorage.setItem('redirected', 'true');
      router.push({ path: '/products' });
    }
  }
});

// Normalize name for duplicate check
function normalizeName(value) {
  return value.toLowerCase().replace(/[\s\-_]+/g, "").trim();
}

// Format price with commas
function formatPrice() {
  let digits = formattedPrice.value.replace(/[^\d]/g, '');
  let withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  formattedPrice.value = withCommas;
  price.value = parseInt(digits) || 0;
}

// Add product
async function addProduct() {
  if (!isEnabled.value || isSubmitting.value) return;

  isSubmitting.value = true;
  let token = localStorage.getItem("token");

  if (!token) {
    notyf.error("You must be logged in as admin");
    isSubmitting.value = false;
    return;
  }

  try {
    const response = await api.post(
      "https://rmantonio-ecommerceapi.onrender.com/products",
      {
        name: name.value.trim(),
        description: description.value,
        price: Number(price.value),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 201) {
      notyf.success("Product added successfully");
      router.push("/products");
    }
  } catch (error) {
    if (error.response?.status === 409) {
      notyf.error("Product already exists");
    } else if ([401, 403].includes(error.response?.status)) {
      notyf.error("Unauthorized: Admin access required");
    } else {
      notyf.error(error.response?.data?.message || "Server error");
    }
  } finally {
    isSubmitting.value = false;
  }
}

// Cancel product addition
function cancelProduct() {
  if (isCanceling.value) return;
  isCanceling.value = true;

  setTimeout(() => {
    router.push("/products");
  }, 500); // short delay to show spinner
}
</script>

<template>
  <div class="container-fluid my-5">
    <div class="row d-flex justify-content-center">
      <div class="col-md-8">
        <div class="apple-shadow p-4 rounded-3">
          <h3 class="card-title mb-4 text-center">
            <i class="bi bi-plus-circle me-2"></i> Add Product
          </h3>

          <form @submit.prevent="addProduct">
            <!-- Name -->
            <div class="form-group mb-3">
              <label for="nameInput" class="form-label">Name:</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-tag-fill"></i></span>
                <input
                  type="text"
                  id="nameInput"
                  class="form-control"
                  placeholder="Enter name"
                  v-model="name"
                  required
                />
              </div>
            </div>

            <!-- Description -->
            <div class="form-group mb-3">
              <label for="descriptionInput" class="form-label">Description:</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-card-text"></i></span>
                <textarea
                  id="descriptionInput"
                  class="form-control"
                  rows="5"
                  placeholder="Enter description"
                  v-model="description"
                  required
                ></textarea>
              </div>
            </div>

            <!-- Price -->
            <div class="form-group mb-4">
              <label for="priceInput" class="form-label">Price:</label>
              <div class="input-group">
                <span class="input-group-text">₱</span>
                <input
                  type="text"
                  id="priceInput"
                  class="form-control"
                  placeholder="Enter price"
                  v-model="formattedPrice"
                  @input="formatPrice"
                  required
                />
              </div>
            </div>

            <!-- Buttons -->
            <div class="d-flex gap-2">
              <!-- Submit -->
              <button
                type="submit"
                class="btn btn-success d-flex align-items-center justify-content-center gap-2"
                :disabled="!isEnabled || isSubmitting"
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
                class="btn btn-outline-success d-flex align-items-center justify-content-center gap-2"
                :disabled="isCanceling"
                @click="cancelProduct"
              >
                <template v-if="!isCanceling">
                  <i class="bi bi-x-circle-fill"></i>
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
</template>
