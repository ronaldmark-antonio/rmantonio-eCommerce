<script setup>
import { watch, ref, onBeforeMount } from 'vue';
import { Notyf } from 'notyf'; 
import { useGlobalStore } from '../stores/global';
import { useRouter, RouterLink } from 'vue-router';
import axios from 'axios';
import api from "../api";

const router = useRouter()
const {getUserDetails, user} = useGlobalStore();

const email = ref("");
const password = ref("");
const isEnabled = ref(false);

const notyf = new Notyf();

watch([email,password], (currentValue, oldValue) => {

    if(currentValue.every(input => input !== "")){
        isEnabled.value = true
    } else {
        isEnabled.value = false
    }

});
 
async function handleSubmit(e){
	e.preventDefault();

	try {

		let res = await api.post('/users/login', {
			email: email.value,
			password: password.value
		})

		console.log(res);

		if(res.data){

			notyf.success("Login Successful");
			localStorage.setItem("token", res.data.access);   

			getUserDetails(res.data.access);

			email.value = "";
			password.value = "";

			router.push({ path: '/products' });

		}
	}

	catch(err){
		console.log(err);
              
		if(err.response.status === 404 || err.response.status === 401 || err.response.status === 400){
			notyf.error(err.response.data.error);
		} else {
			notyf.error("Login Failed. Please contact administrator.");
		}
	}
}

onBeforeMount(()=> {
    if(user.email){
        router.push({path: "/products"})
    }
})

</script>

<template>
	<div class="container-fluid">
	    <h1 class="my-5 pt-3 text-center">Login</h1> 
	    <div class="row d-flex justify-content-center">
	        <div class="col-md-5 border border rounded-3 mx-auto p-5">
	            <form v-on:submit="handleSubmit">
	                <div class="mb-3">
	                    <label for="emailInput" class="form-label">Email Address</label>
	                    <input type="email" class="form-control" placeholder ="Enter your email address" id="emailInput" v-model="email" />
	                </div>
	                <div class="mb-3">
	                    <label for="passwordInput" class="form-label">Password</label>
	                    <input type="password" class="form-control" placeholder ="Enter your password" id="passwordInput" v-model="password" />
	                </div>
	                <div class="d-grid mt-5">
	                	<button type="submit" class="btn btn-primary btn-block"  v-if="isEnabled">Submit</button>
                		<button type="submit" class="btn btn-danger btn-block" disabled v-else>Submit</button>
	                </div>
	            </form>
	        </div>
	    </div>
    </div>
    <h5 class="text-center p-3">Don't have an account yet? <RouterLink to="/register">Click here</RouterLink> to register.</h5>
</template>