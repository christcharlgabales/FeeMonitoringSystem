<script setup lang="ts">
import type { Member } from '@/stores/membership'
import {
  formatCurrency,
  getTotalPaid,
  getMembershipFee,
  getCBUTarget,
  getCBUBalance,
  getBalance
} from '@/utils/membershipHelpers'

interface Props {
  member: Member
}

defineProps<Props>()
</script>

<template>
  <v-card variant="outlined">
    <v-card-text>
      <div class="mb-2"><strong>Member:</strong> {{ member.name }}</div>
      <div class="mb-2"><strong>Membership Type:</strong> {{ member.membership_type?.name }}</div>

      <v-divider class="my-3"></v-divider>

      <div class="text-subtitle-2 mb-2">Payment Summary:</div>
      <div class="d-flex justify-space-between mb-1">
        <span>Membership Fee Paid:</span>
        <strong>{{ formatCurrency(getTotalPaid(member, 'membership')) }} / {{ formatCurrency(getMembershipFee(member)) }}</strong>
      </div>
      <div class="d-flex justify-space-between mb-1">
        <span>Membership Balance:</span>
        <strong :class="getBalance(member) > 0 ? 'text-error' : 'text-success'">
          {{ formatCurrency(getBalance(member)) }}
        </strong>
      </div>

      <v-divider class="my-3"></v-divider>

      <div class="d-flex justify-space-between mb-1">
        <span>CBU Progress:</span>
        <strong>{{ formatCurrency(member.cbu) }} / {{ formatCurrency(getCBUTarget(member)) }}</strong>
      </div>
      <div class="d-flex justify-space-between">
        <span>CBU Balance:</span>
        <strong :class="getCBUBalance(member) > 0 ? 'text-warning' : 'text-success'">
          {{ formatCurrency(getCBUBalance(member)) }}
        </strong>
      </div>
    </v-card-text>
  </v-card>
</template>