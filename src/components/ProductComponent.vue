<template>
  <div v-if="productData" class="col-12 col-md-6 col-lg-4 my-3">
    <div
      id="ProductCard"
      class="card p-1 cardHighlights apple-shadow apple-hover border-0"
      style="min-height: 100%; background-color: #fff;">
      
      <img
        class="card-img-top rounded"
        :src="productData.imageUrl 
                ? productData.imageUrl 
                : `https://placehold.co/600x400/ffffff/000000?font=lora&text=${encodeURIComponent(productData.name)}`"
        :alt="productData.name"
        style="border: none;"
      />

      <input type="file" @change="uploadImage" class="mt-3" />
      
      <div class="card-body d-flex flex-column gap-2">
        <h4 class="card-title fw-bold mb-2">
          {{ productData.name }}
        </h4>
        <p class="card-text text-muted mb-2">
          {{
            productData.description
              ? productData.description.slice(0, 100) + (productData.description.length > 100 ? '...' : '')
              : 'No description available.'
          }}
        </p>
        <p class="mb-1">
          <span class="fw-semibold">
            Price: &#8369;{{ productData.price.toLocaleString() }}
          </span>
        </p>
        <div class="d-grid d-md-block mt-md-auto">
          <router-link
            class="btn btn-success d-block"
            :to="{ path: `/products/${productData._id}` }"
          >
            <i class="bi bi-info-circle me-1"></i> Details
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { Notyf } from "notyf";

const notyf = new Notyf();

export default {
  props: {
    productData: Object,
  },
  setup(props) {
    const uploadImage = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "FusionTechPro"); // Replace with your preset
      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/djanrocmu/image/upload", // Replace with your cloud name
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (data.secure_url) {
          props.productData.imageUrl = data.secure_url;
          notyf.success("Image uploaded successfully!");
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        notyf.error("Failed to upload image.");
      }
    };

    return { uploadImage };
  },
};
</script>
