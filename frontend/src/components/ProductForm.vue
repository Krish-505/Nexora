<template>
  <div class="form">
    <input
      v-model="productName"
      type="text"
      placeholder="Enter product name"
    />

    <button @click="handleAddProduct">
      Add Product
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['add-product'])

const productName = ref('')

const handleAddProduct = () => {
  if (!productName.value.trim()) return

  emit('add-product', productName.value)

  productName.value = ''
}
</script>

<style scoped>
.form {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

input {
  padding: 10px;
  width: 250px;
}

button {
  padding: 10px 20px;
  cursor: pointer;
}
</style>