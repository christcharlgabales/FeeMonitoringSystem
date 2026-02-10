<script setup lang="ts">
import type { Member } from '@/stores/membership'
import {
  formatCurrency,
  getTotalPaid,
  getMembershipFee,
  getCBUTarget,
  getBalance,
  getPaymentStatus,
  getCBUStatus
} from '@/utils/membershipHelpers'

interface Props {
  members: Member[]
  loading: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  addPayment: [member: Member]
  viewHistory: [member: Member]
}>()
</script>

<template>
  <v-data-table
    :headers="[
      { title: 'Name', key: 'name', sortable: true },
      { title: 'Date Joined', key: 'date_joined', sortable: true },
      { title: 'Membership Fee', key: 'membership', sortable: false },
      { title: 'Payment Status', key: 'status', sortable: false },
      { title: 'Balance', key: 'balance', sortable: false },
      { title: 'CBU Progress', key: 'cbu_progress', sortable: false },
      { title: 'Management Fee', key: 'management_fee', sortable: true },
      { title: 'Monthly Dues', key: 'monthly_dues', sortable: true },
      { title: 'Daily Dues', key: 'daily_dues', sortable: true },
      { title: 'Actions', key: 'actions', sortable: false }
    ]"
    :items="members"
    :loading="loading"
    item-value="id"
    class="elevation-1"
  >
    <template v-slot:item.membership="{ item }">
      <div>
        <div>{{ formatCurrency(getTotalPaid(item, 'membership')) }} / {{ formatCurrency(getMembershipFee(item)) }}</div>
        <v-progress-linear
          :model-value="getPaymentStatus(item).percentage"
          :color="getPaymentStatus(item).color"
          height="6"
          class="mt-1"
        ></v-progress-linear>
      </div>
    </template>

    <template v-slot:item.status="{ item }">
      <v-chip
        :color="getPaymentStatus(item).color"
        size="small"
      >
        {{ getPaymentStatus(item).status }} ({{ getPaymentStatus(item).percentage }}%)
      </v-chip>
    </template>

    <template v-slot:item.balance="{ item }">
      <span :class="getBalance(item) > 0 ? 'text-error' : 'text-success'">
        {{ formatCurrency(getBalance(item)) }}
      </span>
    </template>

    <template v-slot:item.cbu_progress="{ item }">
      <div>
        <div class="text-caption">{{ formatCurrency(item.cbu) }} / {{ formatCurrency(getCBUTarget(item)) }}</div>
        <v-progress-linear
          :model-value="getCBUStatus(item).percentage"
          :color="getCBUStatus(item).color"
          height="6"
          class="mt-1"
        ></v-progress-linear>
      </div>
    </template>

    <template v-slot:item.management_fee="{ item }">
      {{ formatCurrency(item.management_fee) }}
    </template>

    <template v-slot:item.monthly_dues="{ item }">
      {{ formatCurrency(item.monthly_dues) }}
    </template>

    <template v-slot:item.daily_dues="{ item }">
      {{ formatCurrency(item.daily_dues) }}
    </template>

    <template v-slot:item.actions="{ item }">
      <div class="d-flex gap-2">
        <v-btn
          color="primary"
          size="small"
          variant="tonal"
          @click="emit('addPayment', item)"
        >
          Add Payment
        </v-btn>
        <v-btn
          color="info"
          size="small"
          variant="outlined"
          @click="emit('viewHistory', item)"
          prepend-icon="mdi-history"
        >
          History
        </v-btn>
      </div>
    </template>

    <template v-slot:no-data>
      <div class="text-center pa-4">
        <p class="text-h6 mb-2">No members yet</p>
        <p class="text-body-2 text-medium-emphasis">Click "Add Member" to get started</p>
      </div>
    </template>
  </v-data-table>
</template>