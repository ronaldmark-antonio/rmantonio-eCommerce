<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notyf } from 'notyf'
import api from '../api'
import { useGlobalStore } from '../stores/global'

const router = useRouter()
const notyf = new Notyf()
const { user } = useGlobalStore()

const firstName = ref('')
const lastName = ref('')
const mobileNo = ref('')
const email = ref('')
const isAdmin = ref(false) // boolean for admin

const newPassword = ref('')
const confirmPassword = ref('')

const handleReset = async () => {
  if (newPassword.value !== confirmPassword.value) {
    notyf.error("Passwords do not match")
    return
  }

  try {
    const token = user.token || localStorage.getItem('token')
    if (!token) {
      notyf.error('You are not authorized')
      return
    }

    const response = await api.patch(
      '/users/update-password',
      { newPassword: newPassword.value },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    notyf.success(response.data.message || 'Password reset successfully')

    newPassword.value = ''
    confirmPassword.value = ''
    router.push('/products')
    
  } catch (err) {
    const msg = err.response?.data?.message || 'Password reset failed'
    notyf.error(msg)
  }
}

onBeforeMount(async () => {
  if (!user.token) {
    router.push('/login')
    return
  }

  try {
    const { data } = await api.get('https://rmantonio-ecommerceapi.onrender.com/users/details', {
      headers: { Authorization: `Bearer ${user.token}` },
    })

    firstName.value = data.user.firstName || ''
    lastName.value = data.user.lastName || ''
    mobileNo.value = data.user.mobileNo || ''
    email.value = data.user.email || ''
    isAdmin.value = data.user.isAdmin || false
  } catch (err) {
    notyf.error('Failed to load profile info.')
  }
})
</script>

<template>
  <div class="container-fluid">
    <div class="row d-flex justify-content-center p-5">
      <div class="col-md-5 register-card apple-shadow p-5">
        <h1 class="my-3 text-center">
          <i class="fas fa-user-circle me-2"></i> Profile Details
        </h1>

        <div class="text-center mb-4">
          <span 
            class="badge fs-6"
            :class="isAdmin ? 'bg-success' : 'border border-success text-success'">
            {{ isAdmin ? 'Admin Account' : 'Regular Account' }}
          </span>
        </div>

        <div class="mb-2">
          <label class="form-label">First Name:</label>
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-user"></i></span>
            <input type="text" class="form-control" :value="firstName" disabled />
          </div>
        </div>

        <div class="mb-2">
          <label class="form-label">Last Name:</label>
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-user-tag"></i></span>
            <input type="text" class="form-control" :value="lastName" disabled />
          </div>
        </div>

        <div class="mb-2">
          <label class="form-label">Mobile Number:</label>
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-phone"></i></span>
            <input type="text" class="form-control" :value="mobileNo" disabled />
          </div>
        </div>

        <div class="mb-2">
          <label class="form-label">Email Address:</label>
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-envelope"></i></span>
            <input type="email" class="form-control" :value="email" disabled />
          </div>
        </div>

        <div class="mt-5">
          <h3 class="card-title mb-3">
            <i class="fas fa-key me-2"></i> Reset Password
          </h3>
          <form @submit.prevent="handleReset">
            <div class="mb-3">
              <label for="newPassword" class="form-label">New Password</label>
              <div class="input-group">
                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                <input
                  type="password"
                  id="newPassword"
                  v-model="newPassword"
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <div class="input-group">
                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                <input
                  type="password"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  class="form-control"
                  required
                />
              </div>
            </div>

            <button type="submit" class="btn btn-success w-100">
              <i class="fas fa-check-circle me-2"></i> Submit
            </button>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>