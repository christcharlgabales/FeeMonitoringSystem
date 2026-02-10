<script setup lang="ts">
import { computed } from 'vue'
import type { Member, Payment } from '@/stores/membership'
import {
  formatCurrency,
  formatDateTime,
  formatDate,
  getPaymentTypeLabel
} from '@/utils/membershipHelpers'

interface Props {
  modelValue: boolean
  member: Member | null
  payments: Payment[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  editPayment: [payment: Payment]
  deletePayment: [payment: Payment]
}>()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <v-dialog v-model="show" max-width="1000px" scrollable>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">Payment History - {{ member?.name }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="show = false"
        ></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text style="max-height: 500px;">
        <v-data-table
          :headers="[
            { title: 'Date & Time Recorded', key: 'created_at', sortable: true },
            { title: 'Payment Date', key: 'payment_date', sortable: true },
            { title: 'Payment Type', key: 'payment_type', sortable: true },
            { title: 'Amount', key: 'amount', sortable: true },
            { title: 'Notes', key: 'notes', sortable: false },
            { title: 'Actions', key: 'actions', sortable: false, width: '150' }
          ]"
          :items="payments"
          item-value="id"
          class="elevation-0"
          density="comfortable"
        >
          <template v-slot:item.created_at="{ item }">
            <div>
              <div class="font-weight-medium">{{ formatDateTime(item.created_at) }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ new Date(item.created_at).toLocaleString('en-PH', { weekday: 'long' }) }}
              </div>
              <div v-if="item.edited_at" class="text-caption text-warning">
                Edited: {{ formatDateTime(item.edited_at) }}
              </div>
            </div>
          </template>

          <template v-slot:item.payment_date="{ item }">
            {{ formatDate(item.payment_date) }}
          </template>

          <template v-slot:item.payment_type="{ item }">
            <v-chip
              size="small"
              :color="
                item.payment_type === 'membership' ? 'primary' :
                item.payment_type === 'cbu' ? 'success' :
                item.payment_type === 'monthly_dues' ? 'info' :
                'secondary'
              "
            >
              {{ getPaymentTypeLabel(item.payment_type) }}
            </v-chip>
          </template>

          <template v-slot:item.amount="{ item }">
            <span class="font-weight-bold text-success">
              {{ formatCurrency(item.amount) }}
            </span>
          </template>

          <template v-slot:item.notes="{ item }">
            <span class="text-caption">{{ item.notes || '—' }}</span>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="emit('editPayment', item)"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="emit('deletePayment', item)"
              ></v-btn>
            </div>
          </template>

          <template v-slot:no-data>
            <div class="text-center pa-4">
              <v-icon size="64" color="grey-lighten-1">mdi-receipt-text-outline</v-icon>
              <p class="text-h6 mt-2">No payment history</p>
              <p class="text-body-2 text-medium-emphasis">Payments will appear here once recorded</p>
            </div>
          </template>
        </v-data-table>

        <!-- Payment Summary Footer -->
        <v-card variant="outlined" class="mt-4" v-if="payments.length > 0">
          <v-card-text>
            <div class="text-subtitle-1 font-weight-bold mb-3">Total Payments by Type:</div>
            <v-row>
              <v-col cols="6" md="3">
                <div class="text-caption text-medium-emphasis">Membership Fee</div>
                <div class="text-h6">
                  {{ formatCurrency(payments.filter(p => p.payment_type === 'membership').reduce((sum, p) => sum + Number(p.amount), 0)) }}
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-caption text-medium-emphasis">Monthly Dues</div>
                <div class="text-h6">
                  {{ formatCurrency(payments.filter(p => p.payment_type === 'monthly_dues').reduce((sum, p) => sum + Number(p.amount), 0)) }}
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-caption text-medium-emphasis">Daily Dues</div>
                <div class="text-h6">
                  {{ formatCurrency(payments.filter(p => p.payment_type === 'daily_dues').reduce((sum, p) => sum + Number(p.amount), 0)) }}
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-caption text-medium-emphasis">CBU</div>
                <div class="text-h6">
                  {{ formatCurrency(payments.filter(p => p.payment_type === 'cbu').reduce((sum, p) => sum + Number(p.amount), 0)) }}
                </div>
              </v-col>
            </v-row>
            <v-divider class="my-3"></v-divider>
            <div class="d-flex justify-space-between align-center">
              <span class="text-h6">Grand Total:</span>
              <span class="text-h5 font-weight-bold text-success">
                {{ formatCurrency(payments.reduce((sum, p) => sum + Number(p.amount), 0)) }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="elevated"
          @click="show = false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>