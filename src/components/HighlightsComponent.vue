<template>
  <div class="row my-5">
    <h1 class="text-center mb-5">Why Shop with Us?</h1>

    <div class="col-md-4">
      <div class="card p-4 min-height-100 apple-shadow apple-hover">
        <div class="card-body text-center">
          <h1 class="display-1 text-success">
            <i class="bi bi-cash-stack"></i>
          </h1>
          <h4 class="card-title mt-3">Best Price Guarantee</h4>
          <p class="card-text mt-3">
            Get the best deals on Apple and Android products at the most competitive prices.
          </p>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card p-4 min-height-100 apple-shadow apple-hover">
        <div class="card-body text-center">
          <h1 class="display-1 text-success">
            <i class="bi bi-shield-lock"></i>
          </h1>
          <h4 class="card-title mt-3">Fast & Secure Checkout</h4>
          <p class="card-text mt-3">
            Your payments are encrypted and protected — shop with confidence and ease.
          </p>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card p-4 min-height-100 apple-shadow apple-hover">
        <div class="card-body text-center">
          <h1 class="display-1 text-success">
            <i class="bi bi-headset"></i>
          </h1>
          <h4 class="card-title mt-3">24/7 Customer Support</h4>
          <p class="card-text mt-3">
            We’re here whenever you need us — day or night, our team is ready to help.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.apple-shadow {
  box-shadow:
    0 10px 15px rgba(0, 0, 0, 0.08),
    0 4px 6px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  border: none;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
}

.apple-hover:hover {
  box-shadow:
    0 20px 30px rgba(0, 0, 0, 0.12),
    0 8px 15px rgba(0, 0, 0, 0.1);
}
</style>
