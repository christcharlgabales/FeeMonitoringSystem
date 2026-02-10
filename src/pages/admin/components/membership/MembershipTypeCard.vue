<script setup lang="ts">
import type { MembershipType } from '@/stores/membership'
import { formatCurrency } from '@/utils/membershipHelpers'

interface Props {
  membershipType: MembershipType
  memberCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  click: [type: MembershipType]
}>()
</script>

<template>
  <v-card
    :color="membershipType.color"
    dark
    hover
    @click="emit('click', membershipType)"
    class="cursor-pointer"
  >
    <v-card-title class="text-h5">{{ membershipType.name }}</v-card-title>
    <v-card-subtitle class="text-h6 mt-2">
      {{ formatCurrency(membershipType.fee) }}
    </v-card-subtitle>
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-2">
        <span>Members: {{ memberCount }}</span>
        <v-icon>mdi-arrow-right</v-icon>
      </div>
      <div class="text-caption">
        CBU Target: {{ formatCurrency(membershipType.cbu_target) }}
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>