<script setup>
import { ref, watch, onBeforeMount } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useGlobalStore } from '../stores/global';
import { Notyf } from 'notyf';
import api from '../api';

const { user } = useGlobalStore();
const notyf = new Notyf();
const router = useRouter();

onBeforeMount(() => {
  if (user.token) {
    router.replace('/products');
  }
});

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const mobileNum = ref("");
const password = ref("");
const confirmPass = ref("");
const submitEnabled = ref(false);

watch([firstName, lastName, email, mobileNum, password, confirmPass], 
  (currValue, oldValue) => {
    
    if (currValue.every(input => input)) {
      submitEnabled.value = true
    } else {
      submitEnabled.value = false
    }
}
);

async function handleSubmit(e) {
  e.preventDefault()
  
  if (password.value !== confirmPass.value) {
    notyf.error("Passwords do not match.");
    submitEnabled.value = false;
    return;
  }

  try {
    
    let res = await api.post("/users/register", {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
      mobileNo: mobileNum.value,
    });

    if (res.status === 201) {
      notyf.success(res.data.message);

      firstName.value = "";
      lastName.value = "";
      mobileNum.value = ""
      email.value = "";
      password.value = "";
      confirmPass.value = "";

      router.push("/login")

    } else {
      notyf.error("Registeration failed. Please contact administrator.");
    }

  } catch(err) {
    
    if (err.response.status === 400) {
      notyf.error(err.response.data.error);
    } else {
      notyf.error("Registeration failed. Please contact administrator.");
    }
  }
}
</script>

<template>
  <div class="container-fluid">
    <h1 class="my-5 text-center">Register</h1>
    <div class="row d-flex justify-content-center">
      <div class="col-md-6 border rounded-3 mx-auto p-5">
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="fName" class="form-label">First Name</label>
            <input 
              type="text" 
              class="form-control" 
              id="fName" 
              placeholder="Enter your first name..." 
              v-model="firstName" 
              required />
          </div>
          <div class="mb-3">
            <label for="lName" class="form-label">Last Name</label>
            <input 
              type="text" 
              class="form-control" 
              id="lName" 
              placeholder="Enter your last name..." 
              v-model="lastName" 
              required />
          </div>
          <div class="mb-3">
            <label for="mobile" class="form-label">Mobile Number</label>
            <input 
              type="text" 
              class="form-control" 
              id="mobile" 
              placeholder="Enter your mobile number..." 
              v-model="mobileNum" 
              required />
          </div>
          <div class="mb-3">
            <label for="emailInput" class="form-label">Email Address</label>
            <input 
              type="email" 
              class="form-control" 
              id="emailInput"
              placeholder="Enter your email..." 
              v-model="email" 
              required />
          </div>
          <div class="mb-3">
            <label for="passwordInput" class="form-label">Password</label>
            <input 
              type="password" 
              class="form-control" 
              id="passwordInput" 
              placeholder="Enter your password..." 
              v-model="password" 
              required />
          </div>
          <div class="mb-3">
            <label for="cpasswordInput" class="form-label">Confirm Password</label>
            <input 
              type="password" 
              class="form-control" 
              id="cpasswordInput"  
              placeholder="Confirm your password..." 
              v-model="confirmPass" 
              required />
          </div>

          <div>
            <button 
              type="submit" 
              class="btn btn-primary btn-block" 
              v-if="submitEnabled">Submit</button>
            <button 
              type="submit" 
              class="btn btn-danger btn-block" 
              disabled v-else>Submit</button>
          </div>
        </form>
      </div>
    </div>
    <h5 class="text-center p-3 mb-5">Already have an account? 
      <RouterLink to="/login">Click here</RouterLink> to log in.</h5>
  </div>
</template>