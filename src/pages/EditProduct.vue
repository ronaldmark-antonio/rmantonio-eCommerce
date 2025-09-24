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
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title mb-4">Update Product</h3>
            <form @submit.prevent="handleUpdate">
              <div class="mb-3">
                <label for="name" class="form-label">Name</label>
                <input
                  type="text"
                  id="name"
                  class="form-control"
                  v-model="name"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea
                  id="description"
                  v-model="description"
                  class="form-control"
                  placeholder="Enter product description"
                  required
                ></textarea>
              </div>

              <div class="mb-3">
                <label for="price" class="form-label">Price</label>
                <input
                  type="number"
                  id="price"
                  v-model="price"
                  class="form-control"
                  placeholder="Enter product price"
                  required
                />
              </div>
              <button type="submit" class="btn btn-success" v-if="updateEnabled">Update</button>
              <button type="submit" class="btn btn-danger" v-else disabled>Update</button>
            </form>
          </div>
        </div>
        <RouterLink to="/products" class="my-3 btn btn-danger">Back</RouterLink>
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
