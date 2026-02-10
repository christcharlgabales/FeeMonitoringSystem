<script setup lang="ts">
import { computed } from 'vue'
import type { MembershipType } from '@/stores/membership'
import { formatCurrency } from '@/utils/membershipHelpers'

interface Props {
  modelValue: boolean
  membershipType: MembershipType | null
  loading: boolean
  form: {
    name: string
    initial_payment: number
    cbu: number
    management_fee: number
    monthly_dues: number
    daily_dues: number
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
        <span class="text-h5">Add New Member - {{ membershipType?.name }}</span>
      </v-card-title>

      <v-card-text>
        <v-alert
          type="info"
          variant="tonal"
          class="mb-4"
        >
          <div class="d-flex justify-space-between align-center">
            <span>Membership Type: <strong>{{ membershipType?.name }}</strong></span>
            <span>Fee: <strong>{{ formatCurrency(membershipType?.fee || 0) }}</strong></span>
          </div>
          <div class="text-caption mt-1">
            CBU Target: {{ formatCurrency(membershipType?.cbu_target || 0) }}
          </div>
        </v-alert>

        <v-form @submit.prevent="emit('submit')">
          <v-text-field
            v-model="form.name"
            label="Member Name*"
            required
            :disabled="loading"
          ></v-text-field>

          <v-text-field
            v-model.number="form.initial_payment"
            label="Initial Payment (Membership Fee)"
            type="number"
            prefix="₱"
            hint="Leave as 0 if no initial payment"
            :disabled="loading"
          ></v-text-field>

          <v-divider class="my-4"></v-divider>

          <v-text-field
            v-model.number="form.cbu"
            label="Initial CBU (Capital Build Up)"
            type="number"
            prefix="₱"
            :disabled="loading"
            hint="Optional starting CBU amount"
          ></v-text-field>

          <v-text-field
            v-model.number="form.management_fee"
            label="Management Fee"
            type="number"
            prefix="₱"
            :disabled="loading"
          ></v-text-field>

          <v-text-field
            v-model.number="form.monthly_dues"
            label="Monthly Dues"
            type="number"
            prefix="₱"
            :disabled="loading"
          ></v-text-field>

          <v-text-field
            v-model.number="form.daily_dues"
            label="Daily Dues"
            type="number"
            prefix="₱"
            :disabled="loading"
          ></v-text-field>
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
          Add Member
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>