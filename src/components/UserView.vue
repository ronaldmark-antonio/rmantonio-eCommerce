<template>
    <div class="row">
        <div class="col my-5">
            <h1 class="text-center py-1">Our Products</h1>
        </div>
    </div>
    <div class="row g-4">

      		<CourseComponent v-for="course in coursesData" :courseData="course" />
		</div>
</template>

<script setup>
import CourseComponent from '../components/CourseComponent.vue';
import { defineProps } from 'vue';

const props = defineProps({
    coursesData: Array
});

</script>