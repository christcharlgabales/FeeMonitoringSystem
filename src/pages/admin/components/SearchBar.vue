<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  label: 'Search members by name'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <v-text-field
    :model-value="modelValue"
    @update:model-value="handleInput"
    prepend-inner-icon="mdi-magnify"
    :label="label"
    :placeholder="placeholder"
    variant="outlined"
    density="compact"
    clearable
    hide-details
  ></v-text-field>
</template>