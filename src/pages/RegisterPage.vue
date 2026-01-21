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

const showPassword = ref(false);
const showConfirmPassword = ref(false);

watch([firstName, lastName, email, mobileNum, password, confirmPass], 
  (currValue, oldValue) => {
    
    if (currValue.every(input => input)) {
      submitEnabled.value = true
    } else {
      submitEnabled.value = false
    }
}
);

const submitting = ref(false);

async function handleSubmit(e) {
  e.preventDefault();

  if (password.value !== confirmPass.value) {
    notyf.error("Passwords do not match");
    submitEnabled.value = false;
    return;
  }

  submitting.value = true; // start loading

  try {
    let res = await api.post("https://rmantonio-ecommerceapi.onrender.com/users/register", {
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
      mobileNum.value = "";
      email.value = "";
      password.value = "";
      confirmPass.value = "";

      router.push("/login");

    } else {
      notyf.error("Registration failed. Please contact administrator");
    }

  } catch(err) {
    if (err.response?.status === 400 || err.response?.status === 409) {
      notyf.error(err.response.data.error);
    } else {
      notyf.error("Registration failed. Please contact administrator");
    }
  } finally {
    submitting.value = false; // stop loading
  }
}

</script>

<template>
  <div class="container-fluid">
    <div class="row d-flex justify-content-center p-5">
      <div class="col-md-5 register-card apple-shadow p-4">
        <h1 class="my-3 text-center">
          <i class="fas fa-user-plus text-success me-1"></i> Register
        </h1>
        <p class="text-center mb-3 pb-1">
            Sign up now! Create your account today.
        </p>
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
                placeholder="Enter your first name" 
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
                placeholder="Enter your last name" 
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
                placeholder="Enter your mobile number" 
                v-model="mobileNum" 
                required />
            </div>
          </div>

          <div class="mb-2">
            <label for="emailInput" class="form-label">Email Address:</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-envelope"></i></span>
              <input 
                type="text" 
                class="form-control" 
                id="emailInput"
                placeholder="Enter your email address" 
                v-model="email" 
                required/>
            </div>
          </div>

          <div class="mb-2">
            <label class="form-label">Password:</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-lock"></i>
                </span>

                <input
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  placeholder="Enter your password"
                  v-model="password"
                  required
                />

                <span
                  class="input-group-text password-eye"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </span>
              </div>
          </div>

          <div class="mb-2">
            <label class="form-label">Confirm Password:</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-lock"></i>
                </span>

                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-control"
                  placeholder="Confirm your password"
                  v-model="confirmPass"
                  required
                />

                <span
                  class="input-group-text password-eye"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </span>
              </div>
          </div>

          <div class="d-grid mt-3">
            <button 
              type="submit" 
              class="btn btn-success btn-block" 
              :disabled="!submitEnabled || submitting"
            >
              <i v-if="!submitting" class="fas fa-check-circle me-2"></i>
              <span v-else class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              
              {{ submitting ? 'Submitting...' : 'Submit' }}
            </button>
          </div>

        </form>
        <p class="text-center p-3 mb-1">
          Already have an account? 
          <RouterLink to="/login" class="text-success">Click here</RouterLink> to log in.
        </p>
      </div>
    </div>
  </div>
</template>