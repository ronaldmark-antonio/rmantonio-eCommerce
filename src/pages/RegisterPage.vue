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
    <div class="row d-flex justify-content-center p-5">
      <div class="col-md-5 border border rounded-2 p-5">
        <h1 class="my-3 text-center">Register</h1>
        <form @submit.prevent="handleSubmit">
          <!-- First Name Field -->
                <div class="mb-2">
                    <label for="firstNameInput" class="form-label">First Name:</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                        <input 
                          type="text" 
                          class="form-control" 
                          id="fName" 
                          placeholder="Enter your first name..." 
                          v-model="firstName" 
              required />
                    </div>
                </div>

                <div class="mb-2">
                    <label for="lastNameInput" class="form-label">Last Name:</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-user-tag"></i></span>
                        <input 
                          type="text" 
                          class="form-control" 
                          id="lName" 
                          placeholder="Enter your last name..." 
                          v-model="lastName" 
                          required/>
                    </div>
                </div>

                <div class="mb-2">
                    <label for="mobileInput" class="form-label">Mobile Number:</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-phone"></i></span>
                        <input 
                          type="text" 
                          class="form-control" 
                          id="mobile" 
                          placeholder="Enter your mobile number..." 
                          v-model="mobileNum" 
                          required />
                    </div>
                </div>

                <div class="mb-2">
                    <label for="emailInput" class="form-label">Email Address:</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                        <input 
                          type="email" 
                          class="form-control" 
                          id="emailInput"
                          placeholder="Enter your email..." 
                          v-model="email" 
                          required/>
                    </div>
                </div>

                <div class="mb-2">
                    <label for="passwordInput" class="form-label">Password:</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-lock"></i></span>
                        <input 
                          type="password" 
                          class="form-control" 
                          id="passwordInput" 
                          placeholder="Enter your password..." 
                          v-model="password" 
                          required />
                    </div>
                </div>

                <div class="mb-2">
                    <label for="confirmPasswordInput" class="form-label">Confirm Password:</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-lock"></i></span>
                        <input 
                          type="password" 
                          class="form-control" 
                          id="cpasswordInput"  
                          placeholder="Confirm your password..." 
                          v-model="confirmPass" 
                          required />
                    </div>
                </div>

                <div class="d-grid mt-3">
                  <button 
                  type="submit" 
                  class="btn btn-success btn-block" 
                  v-if="submitEnabled">Submit</button>
                  <button 
                  type="submit" 
                  class="btn btn-success btn-block" 
                  disabled v-else>Submit</button>
                </div>
        </form>
        <h6 class="text-center p-3 mb-1">Already have an account? 
      <RouterLink to="/login">Click here</RouterLink> to log in.</h6>
      </div>
    </div>
  </div>
</template>