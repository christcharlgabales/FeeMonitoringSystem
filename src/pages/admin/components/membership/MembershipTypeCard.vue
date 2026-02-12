<script setup lang="ts">
import type { MembershipType } from '@/stores/membership'
import { formatCurrency } from '@/utils/membershipHelpers'
import '../../../../styles/MembershipCard.css'

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
  <div 
    class="membership-card"
    :style="{ '--card-color': membershipType.color }"
    @click="emit('click', membershipType)"
  >
    <div class="card-background"></div>
    <div class="card-content">
      <div class="card-header">
        <h3 class="card-title">{{ membershipType.name }}</h3>
        <div class="card-icon">
          <v-icon>mdi-card-account-details</v-icon>
        </div>
      </div>

      <div class="card-price">
        <span class="currency-symbol">₱</span>
        <span class="amount">{{ formatCurrency(membershipType.fee).replace('₱', '') }}</span>
      </div>

      <div class="card-details">
        <div class="detail-row">
          <div class="detail-item">
            <v-icon size="small" class="detail-icon">mdi-account-group</v-icon>
            <span class="detail-label">Members</span>
            <span class="detail-value">{{ memberCount }}</span>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-item full-width">
            <v-icon size="small" class="detail-icon">mdi-target</v-icon>
            <span class="detail-label">CBU Target</span>
            <span class="detail-value">{{ formatCurrency(membershipType.cbu_target) }}</span>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <span class="view-details">View Details</span>
        <v-icon class="arrow-icon">mdi-arrow-right</v-icon>
      </div>

      <div class="shine-effect"></div>
    </div>
  </div>
</template>