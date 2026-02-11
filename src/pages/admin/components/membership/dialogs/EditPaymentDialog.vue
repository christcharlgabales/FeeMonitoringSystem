//EditPaymentDialog.vue
<script setup lang="ts">
import { computed } from 'vue'
import { paymentTypeOptions } from '@/utils/membershipHelpers'

interface Props {
  modelValue: boolean
  loading: boolean
  form: {
    type: 'membership' | 'monthly_dues' | 'daily_dues' | 'cbu'
    amount: number
    payment_date: string
    notes: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: []
}>()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <v-dialog v-model="show" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Edit Payment</span>
      </v-card-title>

      <v-card-text>
        <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
          <div class="text-caption">
            ⚠️ Editing this payment will recalculate balances and CBU automatically
          </div>
        </v-alert>

        <v-form @submit.prevent="emit('submit')">
          <v-select
            v-model="form.type"
            :items="paymentTypeOptions"
            label="Payment Type*"
            required
            :disabled="loading"
          ></v-select>

          <v-text-field
            v-model.number="form.amount"
            label="Payment Amount*"
            type="number"
            prefix="₱"
            required
            :disabled="loading"
          ></v-text-field>

          <v-text-field
            v-model="form.payment_date"
            label="Payment Date"
            type="date"
            :disabled="loading"
          ></v-text-field>

          <v-textarea
            v-model="form.notes"
            label="Notes (Optional)"
            rows="2"
            :disabled="loading"
          ></v-textarea>
        </v-form>
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
          color="primary"
          variant="elevated"
          @click="emit('submit')"
          :loading="loading"
        >
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>