<script setup>
  import AdminOrdersView from '@/components/AdminOrdersView.vue';
  import UserOrdersView from '../components/UserOrdersView.vue';
  import { useGlobalStore } from '@/stores/global';

  const { user } = useGlobalStore();
</script>

<template>
	<AdminOrdersView v-if="user.isAdmin" />
	<UserOrdersView v-else />
</template>
