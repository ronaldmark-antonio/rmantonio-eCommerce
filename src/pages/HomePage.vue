<script>
import BannerComponent from '../components/BannerComponent.vue';
import HighlightsComponent from '../components/HighlightsComponent.vue';

export default {
  components: {
    BannerComponent,
    HighlightsComponent
  },
  data() {
    return {
        bannerProps: {
          title: "Tech Without Borders",
          tagline: "Connected Without Limits",
          destination: "Products",
          buttonLabel: "View Our Products"
        }
    };
  }
}
</script>

<template>
  <div class="container-fluid">
    <BannerComponent :bannerProps=bannerProps />
    <HighlightsComponent />
  </div>
</template>

<style scoped>
.banner-title {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 3rem;
  color: #111;
}

.banner-tagline {
  font-family: 'Lato', sans-serif;
  font-weight: 4100;
  font-size: 1.25rem;
  color: #555;
  margin-top: 0.5rem;
}
</style>