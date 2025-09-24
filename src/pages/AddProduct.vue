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
    const response = await fetch("http://localhost:4000/products", {
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
</script>

<template>
  <div class="container-fluid my-5">
    <div class="row d-flex justify-content-center">
      <div class="col-md-8">
        <!-- Card for the form -->
        <div class="card shadow-sm rounded-3">
          <div class="card-body">
            <h3 class="card-title mb-4 text-center">Add Product</h3>

            <form @submit.prevent="addProduct">
              <div class="form-group">
                <label for="nameInput">Name:</label>
                <input
                  type="text"
                  class="form-control"
                  id="nameInput"
                  placeholder="Enter Name"
                  v-model="name"
                  required
                />
              </div>

              <div class="form-group mt-3">
                <label for="descriptionInput">Description:</label>
                <textarea
                  class="form-control"
                  id="descriptionInput"
                  rows="5"
                  placeholder="Enter Description"
                  v-model="description"
                  required
                ></textarea>
              </div>

              <div class="form-group mt-3">
                <label for="priceInput">Price:</label>
                <input
                  type="number"
                  class="form-control"
                  id="priceInput"
                  placeholder="Enter Price"
                  min="0"
                  v-model="price"
                  required
                />
              </div>

              <div class="d-flex mt-3">
                <button
                  type="submit"
                  class="btn btn-primary w-48"
                  v-if="!isEnabled"
                  disabled
                >Submit
                </button>
                <button
                  type="submit"
                  class="btn btn-primary w-48"
                  v-else
                >Submit
                </button>
                <RouterLink
                  to="/products"
                  class="btn btn-danger w-48 me-2 mx-2" 
                >Cancel
                </RouterLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
