<template>
  <div class="product-list">
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      :editingId="editingId"
      @delete-product="emit('delete-product', $event)"
      @edit-product="emit('edit-product', $event)"
      @update-product="emit('update-product', $event)"
      @cancel-edit="emit('cancel-edit')"
    />
  </div>
</template>

<script setup>
import ProductCard from './ProductCard.vue'

defineProps({
  products: Array,
  editingId: Number,
})

const emit = defineEmits([
  'delete-product',
  'edit-product',
  'update-product',
  'cancel-edit',
])
</script>

<style scoped>
.product-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>