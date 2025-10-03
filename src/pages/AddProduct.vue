<script setup>
import { onBeforeMount, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api";
import { useGlobalStore } from "../stores/global";
import { Notyf } from "notyf";

const notyf = new Notyf();
const { user } = useGlobalStore();
const router = useRouter();
const course = reactive({ data: null });

const name = ref("");
const description = ref("");
const price = ref("");
const isEnabled = ref(false);

const formattedPrice = ref('');


watch([name, description, price], (currentValue, oldValue) => {
  if (currentValue.every(input => input)) {
    isEnabled.value = true;
  } else {
    isEnabled.value = false;
  }
});

onBeforeMount(() => {
  if (!user.email || !user.isAdmin) {
    if (!localStorage.getItem('redirected')) {
      localStorage.setItem('redirected', 'true');
      router.push({ path: '/products' });
    }
  }
});

async function addProduct(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) return notyf.error("You must be logged in as admin");

  try {
    const response = await fetch("https://86cmr8pnej.execute-api.us-west-2.amazonaws.com/production/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: name.value,
        description: description.value,
        price: Number(price.value)
      })
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (response.status === 409 || data.message === "Product already exists") {
      notyf.error("Product Already Exists");
    } else if (response.status === 201 || data.course === "Product added successfully") {
      notyf.success("Product Added");
      router.push("/products");
    } else {
      notyf.error("Unsuccessful Product Creation");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    notyf.error("Server error: Could not add product");
  }
}

function formatPrice() {
  let digits = formattedPrice.value.replace(/[^\d]/g, '');
  let withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  formattedPrice.value = withCommas;
  price.value = parseInt(digits) || 0;
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
            <div class="form-group mb-3">
              <label for="nameInput" class="form-label">Name:</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-tag-fill"></i>
                </span>
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

            <div class="form-group mb-3">
              <label for="descriptionInput" class="form-label">Description:</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-card-text"></i>
                </span>
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

            <div class="d-flex">
              <button
                type="submit"
                class="btn btn-success"
                :disabled="!isEnabled"
              >
                <i class="bi bi-check-circle-fill me-1"></i> Submit
              </button>
              <RouterLink
                to="/products"
                class="btn btn-outline-success ms-2"
              >
                <i class="bi bi-x-circle-fill me-1"></i> Cancel
              </RouterLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>


