<script setup>
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../stores/global.js';
import UpdatePassword from "../components/UpdatePassword.vue";

const {user} = useGlobalStore();
const router = useRouter()
onBeforeMount(() => {
    if(!user.email){
        router.push({path: '/'})
    }
})
</script>

<template>
    <UpdatePassword />
</template>