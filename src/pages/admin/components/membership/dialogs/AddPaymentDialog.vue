<script setup lang="ts">
import { computed } from 'vue'
import type { Member } from '@/stores/membership'
import { paymentTypeOptions } from '@/utils/membershipHelpers'
import PaymentSummaryCard from '../payment/PaymentSummaryCard.vue'

interface Props {
  modelValue: boolean
  member: Member | null
  loading: boolean
  form: {
    type: 'membership' | 'monthly_dues' | 'daily_dues' | 'cbu'
    amount: number
    notes: string
  }
  showCBUNote: boolean
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
        <span class="text-h5">Add Payment</span>
      </v-card-title>

      <v-card-text v-if="member">
        <PaymentSummaryCard :member="member" class="mb-4" />

        <v-form @submit.prevent="emit('submit')">
          <v-select
            v-model="form.type"
            :items="paymentTypeOptions"
            label="Payment Type*"
            required
            :disabled="loading"
          ></v-select>

          <v-alert
            v-if="showCBUNote"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <div class="text-caption">
              💡 Monthly Dues for {{ member.membership_type?.name }} will automatically be added to CBU
            </div>
          </v-alert>

          <v-text-field
            v-model.number="form.amount"
            label="Payment Amount*"
            type="number"
            prefix="₱"
            required
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
          Record Payment
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>