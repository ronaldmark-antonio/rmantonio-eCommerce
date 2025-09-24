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

onBeforeMount(() => {
    if(!user.email || !user.isAdmin){
        router.push({path: '/products'})
    }
})

const name = ref("");
const description = ref("");
const price = ref("");
const isEnabled = ref(false)

watch([ name, description, price], (currentValue, oldValue) => {
    if(currentValue.every(input => input)){
        isEnabled.value = true
    } else {
        isEnabled.value = false
    }
})

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
    }, body: JSON.stringify({
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
    } else if (response.status === 201 || data.course === "Product added successfully" ) {
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
    <div class="container-fluid">
        <div class="row d-flex justify-content-center">
            <h1 class="my-5 pt-3 text-center">Add Product</h1> 
            <div class="col-md-10 rounded-3 mx-auto p-2">
                <form @submit="addProduct">
                    <div class="form-group mt-3">
                        <label for="nameInput">Name:</label>
                        <input type="text" class="form-control" id="nameInput" aria-describedby="nameHelp" placeholder="Enter Name" v-model="name">
                    </div>
                    <div class="form-group mt-3">
                        <label for="descriptionInput">Description:</label>
                        <input class="form-control" id="descriptionInput" rows="5" placeholder="Enter Description"v-model="description">
                    </div>
                    <div class="form-group mt-3">
                        <label for="priceInput">Price:</label>
                        <input type="number" class="form-control" id="priceInput" aria-describedby="priceHelp" placeholder="Enter Price" min="0" v-model="price">
                    </div>
                    <button type="submit" class="btn btn-primary mt-3" v-if="!isEnabled" disabled>Submit</button>
                    <button type="submit" class="btn btn-primary mt-3" v-else>Submit</button>
                </form>
            </div>
        </div>
    </div>
</template>