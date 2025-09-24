<script setup>
  import { onBeforeMount, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Notyf } from 'notyf';

  import api from '../api';
  import { useGlobalStore } from '../stores/global';

  const route = useRoute();
  const router = useRouter();
  const notyf = new Notyf()
  const { user } = useGlobalStore();
  const name = ref("");
  const description = ref("");
  const price = ref(0);
  const updateEnabled = ref(false);

  watch([name, description, price], (currValue, oldValue) => {
    if (currValue.every(input => input)) {
      updateEnabled.value = true;
    } else {
      updateEnabled.value = false;
    }
  })

  async function handleUpdate() {
    try {
      let res = await api.patch(`/products/${route.params.productId}/update`, {
        name: name.value,
        description: description.value,
        price: price.value,
      });

      if (res.status === 200) {
        notyf.success("Product updated successfully!");

        name.value = ""
        description.value = ""
        price.value = 0
        router.push("/products")
      }
    } catch (err) {
      notyf.error(`Error in product update: ${err.response.data.error}`);
    }
  }

  onBeforeMount(async () => {
    if (!user.token) {
      router.push('/login')
      return
    }

    let { data } = await api.get(`/products/${route.params.productId}`);
    name.value = data.name
    description.value = data.description
    price.value = data.price
  })

</script>

<template>
  <div class="container-fluid my-5">
    <div class="row d-flex justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm rounded-3">
          <div class="card-body">
            <h3 class="card-title mb-4 text-center">Update Product</h3>

            <form @submit.prevent="handleUpdate">
              <div class="form-group">
                <label for="name">Name:</label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="name"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div class="form-group mt-3">
                <label for="description">Description:</label>
                <textarea
                  class="form-control"
                  id="description"
                  rows="5"
                  v-model="description"
                  placeholder="Enter product description"
                  required
                ></textarea>
              </div>

              <div class="form-group mt-3">
                <label for="price">Price</label>
                <input
                  type="number"
                  class="form-control"
                  id="price"
                  v-model="price"
                  placeholder="Enter product price"
                  required
                />
              </div>

              <div class="d-flex mt-3">
                <button
                  type="submit"
                  class="btn btn-success w-48"
                  v-if="updateEnabled"
                >Update
                </button>
                <button
                  type="submit"
                  class="btn btn-danger w-48"
                  v-else
                  disabled
                >Update
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

<style scoped>
  input[type=number]::-webkit-outer-spin-button,
  input[type=number]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
</style>
