<template>
  <div class="row mb-5 py-5 align-items-center" id="banner">
    <div class="col-12 col-md-10 p-4 p-md-5 ms-md-5 text-center text-md-start">
      <h1 class="mb-3" id="banner-title">{{ bannerProps.title }}</h1>
      <p class="mb-5" id="motto">{{ bannerProps.tagline }}</p>
      <router-link
        class="btn btn-success btn-lg rounded-pill px-4 py-2 shadow-sm"
        :to="{ name: bannerProps.destination }"
      >
        {{ bannerProps.buttonLabel }} <i class="bi bi-arrow-right"></i>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    bannerProps: Object
  },
};
</script>

<style scoped>
#banner {
   background: linear-gradient(to right, rgb(255, 255, 255) 20%, rgba(126, 209, 247, 0.5)),
               url('/images/banner-background.png') no-repeat center;
   background-size: cover; 
   background-position: center;
   height: 500px;
   display: flex;
   align-items: center;
   justify-content: flex-start;
   padding: 1rem;
}


h1 {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 2rem;
  color: #111;
}

#motto {
  font-family: "Lato", sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: #444;
  line-height: 1.6;
}

.apple-shadow {
  box-shadow:
    0 10px 15px rgba(0, 0, 0, 0.08),
    0 4px 6px rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  background: #fff;
  transition: box-shadow 0.35s ease, transform 0.25s ease;
}

.apple-hover:hover {
  box-shadow:
    0 20px 30px rgba(0, 0, 0, 0.12),
    0 8px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-6px) scale(1.02);
}

@media (min-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }

  #motto {
    font-size: 1.125rem;
  }
}

@media (min-width: 1200px) {
  h1 {
    font-size: 3rem;
  }

  #motto {
    font-size: 1.25rem;
  }
}
</style>
