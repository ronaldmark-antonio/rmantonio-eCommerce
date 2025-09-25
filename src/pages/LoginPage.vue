<script setup>
import { watch, ref, onBeforeMount } from 'vue';
import { Notyf } from 'notyf'; 
import { useGlobalStore } from '../stores/global';
import { useRouter, RouterLink } from 'vue-router';
import axios from 'axios';
import api from "../api";

const {getUserDetails, user} = useGlobalStore();
const notyf = new Notyf();
const router = useRouter()

onBeforeMount(() => {
  if (user.token) {
    router.replace('/products');
  }
});

const email = ref("");
const password = ref("");
const isEnabled = ref(false);

watch([email,password], (currentValue, oldValue) => {

    if(currentValue.every(input => input !== "")){
        isEnabled.value = true
    } else {
        isEnabled.value = false
    }

});
 
async function handleSubmit(){
	try {
		let res = await api.post('/users/login', {
			email: email.value,
			password: password.value
		})

		if(res.data){

			notyf.success("Login Successful");
			localStorage.setItem("token", res.data.access);   

			getUserDetails(res.data.access);

			email.value = "";
			password.value = "";

			router.push({ path: '/' });

		}
	}

	catch(err){              
		if(err.response.status === 404 || err.response.status === 401 || err.response.status === 400){
			notyf.error(err.response.data.error);
		} else {
			notyf.error("Login Failed. Please contact administrator.");
		}
	}
}
</script>

<template>
	<div class="container-fluid">
    <div class="row d-flex justify-content-center p-5">
        <div class="col-md-5 border border rounded-2 p-5">
        	<h1 class="text-center">Login</h1> 
            <form @submit.prevent="handleSubmit">
                <div class="mb-2">
                    <label for="emailInput" class="form-label">Email Address:</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                        <input 
                            type="email" 
                            class="form-control" 
                            placeholder="Enter your email address" 
                            id="emailInput" 
                            v-model="email" />
                    </div>
                </div>

                <div class="mb-3">
                    <label for="passwordInput" class="form-label">Password:</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-lock"></i></span>
                        <input 
                            type="password" 
                            class="form-control" 
                            placeholder="Enter your password" 
                            id="passwordInput" 
                            v-model="password" />
                    </div>
                </div>

                <div class="d-grid mt-2">
                    <button 
                        type="submit" 
                        class="btn btn-success btn-block"  
                        v-if="isEnabled">Submit</button>
                    
                    <button 
                        type="submit" 
                        class="btn btn-success btn-block" 
                        disabled v-else>Submit</button>
                </div>
            </form>
            <h6 class="text-center mt-3">Don't have an account yet? 
    <RouterLink to="/register">Click here</RouterLink> to register.</h6>
        </div>
    </div>
</div>

</template>