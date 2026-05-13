<template>
  <div class="product-card">
    <!-- NORMAL VIEW -->
    <div v-if="editingId !== product.id">
      <h3>{{ product.name }}</h3>

      <div class="actions">
        <button @click="emit('edit-product', product)">
          Edit
        </button>

        <button @click="emit('delete-product', product.id)">
          Delete
        </button>
      </div>
    </div>

    <!-- EDIT VIEW -->
    <div v-else>
      <input
        v-model="editedName"
        type="text"
      />

      <div class="actions">
        <button @click="handleSave">
          Save
        </button>

        <button @click="emit('cancel-edit')">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  product: Object,
  editingId: Number,
})

const emit = defineEmits([
  'delete-product',
  'edit-product',
  'update-product',
  'cancel-edit',
])

const editedName = ref('')

watch(
  () => props.product,
  (newProduct) => {
    editedName.value = newProduct.name
  },
  { immediate: true }
)

const handleSave = () => {
  emit('update-product', {
    id: props.product.id,
    name: editedName.value,
  })
}
</script>

<style scoped>
.product-card {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

button {
  padding: 10px 20px;
  cursor: pointer;
}

input {
  padding: 10px;
  width: 250px;
}
</style>