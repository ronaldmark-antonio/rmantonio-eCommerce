<script>

  import api from '../api.js';
  import { ref, reactive, onMounted, onBeforeMount, watch } from 'vue';

  import ProductsComponent from '../components/ProductsComponent.vue';
  import UserView from '../components/UserView.vue';
  import { useGlobalStore } from '../stores/global.js';

  export default {
    components: {
      ProductsComponent,
      UserView
    },
      
      setup(){

      const { user } = useGlobalStore();
      const courses = reactive({data:[]})

          onMounted(()=>console.log(courses));

      watch([user], async () => {
        if (!user.isLoading) {
          try {
            if (user.isAdmin) {
              let response = await api.get('/courses/all');
              console.log("Admin courses:", response.data);
              courses.data = response.data;
            } else {
              let response = await api.get('/courses');
              console.log("User courses:", response.data);
              courses.data = response.data;
            }
          } catch (err) {
            console.error("Error fetching courses:", err);
          }
        }
      }, { immediate: true });

          return {
            courses,
        user,
           
          }
      }
  }
</script>

<template>
  <div class="container">
    <p v-if="user.isLoading">Loading...</p>
    <AdminView v-if="user.isAdmin && !user.isLoading" :coursesData="courses.data" />
    <UserView v-if="!user.isAdmin && !user.isLoading" :coursesData="courses.data" />
  </div>
</template>