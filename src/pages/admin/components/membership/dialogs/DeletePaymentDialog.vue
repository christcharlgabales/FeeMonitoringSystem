<script setup lang="ts">
import { computed } from 'vue'
import type { Payment } from '@/stores/membership'
import { formatCurrency, formatDate, getPaymentTypeLabel } from '@/utils/membershipHelpers'

interface Props {
  modelValue: boolean
  loading: boolean
  payment: Payment | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">
        Confirm Delete
      </v-card-title>

      <v-card-text>
        <v-alert type="error" variant="tonal" class="mb-4">
          <div class="text-body-1">
            Are you sure you want to delete this payment?
          </div>
        </v-alert>

        <div v-if="payment">
          <p><strong>Amount:</strong> {{ formatCurrency(payment.amount) }}</p>
          <p><strong>Type:</strong> {{ getPaymentTypeLabel(payment.payment_type) }}</p>
          <p><strong>Date:</strong> {{ formatDate(payment.payment_date) }}</p>
          <p v-if="payment.notes"><strong>Notes:</strong> {{ payment.notes }}</p>
        </div>

        <v-alert type="warning" variant="tonal" density="compact" class="mt-4">
          <div class="text-caption">
            ⚠️ This will automatically adjust balances and CBU. This action cannot be undone.
          </div>
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="show = false"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          variant="elevated"
          @click="emit('confirm')"
          :loading="loading"
        >
          Delete Payment
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>