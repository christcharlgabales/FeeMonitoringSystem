<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthUserStore } from '@/stores/authUser'
import { useToast } from 'vue-toastification'
import { storeToRefs } from 'pinia'
import InnerLayoutWrapper from '@/layouts/InnerLayoutWrapper.vue'
import { useMembers, type Member, type MembershipType } from '@/pages/admin/composables/useMembers'

const authStore = useAuthUserStore()
const toast = useToast()
const { userName, loading: authLoading } = storeToRefs(authStore)

// Use members composable
const {
  members,
  membershipTypes,
  loading,
  fetchMembershipTypes,
  fetchMembers,
  addMember: addMemberToDb,
  addPayment: addPaymentToDb,
  updateMember,
  deleteMember,
  getTotalPaid,
  getMembershipFee,
  getBalance,
  getPaymentStatus
} = useMembers()

// State
const selectedMembershipType = ref<MembershipType | null>(null)
const showAddMemberDialog = ref(false)
const showMemberDetailsDialog = ref(false)
const showPaymentDialog = ref(false)
const selectedMember = ref<Member | null>(null)

// New member form
const newMember = ref({
  name: '',
  initial_payment: 0,
  cbu: 0,
  management_fee: 0,
  monthly_dues: 0,
  daily_dues: 0
})

// Payment form
const newPaymentAmount = ref(0)
const paymentNotes = ref('')

// Computed properties
const filteredMembers = computed(() => {
  if (!selectedMembershipType.value) return []
  return members.value.filter(m => m.membership_type_id === selectedMembershipType.value?.id)
})

const memberCount = (typeId: string) => {
  return members.value.filter(m => m.membership_type_id === typeId).length
}

// Methods
const selectMembershipType = (type: MembershipType) => {
  selectedMembershipType.value = type
  showMemberDetailsDialog.value = true
}

const openAddMemberDialog = () => {
  newMember.value = {
    name: '',
    initial_payment: 0,
    cbu: 0,
    management_fee: 0,
    monthly_dues: 0,
    daily_dues: 0
  }
  showAddMemberDialog.value = true
}

const addMember = async () => {
  if (!newMember.value.name || !selectedMembershipType.value) {
    toast.error('Please fill in the member name')
    return
  }

  const result = await addMemberToDb({
    name: newMember.value.name,
    membership_type_id: selectedMembershipType.value.id, // Use the selected membership type
    initial_payment: newMember.value.initial_payment,
    cbu: newMember.value.cbu,
    management_fee: newMember.value.management_fee,
    monthly_dues: newMember.value.monthly_dues,
    daily_dues: newMember.value.daily_dues
  })

  if (result.success) {
    showAddMemberDialog.value = false
  }
}

const openPaymentDialog = (member: Member) => {
  selectedMember.value = member
  newPaymentAmount.value = 0
  paymentNotes.value = ''
  showPaymentDialog.value = true
}

const addPayment = async () => {
  if (!selectedMember.value || newPaymentAmount.value <= 0) {
    toast.error('Please enter a valid payment amount')
    return
  }

  const result = await addPaymentToDb(
    selectedMember.value.id,
    newPaymentAmount.value,
    paymentNotes.value || undefined
  )

  if (result.success) {
    showPaymentDialog.value = false
  }
}

const handleLogout = async () => {
  try {
    const result = await authStore.signOut()
    if (result.error) {
      toast.error('Logout failed: ' + result.error.message)
    } else {
      toast.success('You have been logged out successfully')
    }
  } catch (error) {
    console.error('Logout error:', error)
    toast.error('An unexpected error occurred during logout')
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount)
}

// Load data on mount
onMounted(async () => {
  await fetchMembershipTypes()
  await fetchMembers()
})
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="pa-6">
        <!-- Header -->
        <v-row class="mb-6">
          <v-col cols="12">
            <h1 class="text-h4 font-weight-bold">Cooperative Membership Management</h1>
            <p class="text-subtitle-1 text-medium-emphasis">Track and manage membership fees and payments</p>
          </v-col>
        </v-row>

        <!-- Loading State -->
        <v-row v-if="loading">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-col>
        </v-row>

        <!-- Membership Type Cards -->
        <v-row v-else>
          <v-col 
            v-for="type in membershipTypes" 
            :key="type.id"
            cols="12" 
            md="4"
          >
            <v-card 
              :color="type.color"
              dark
              hover
              @click="selectMembershipType(type)"
              class="cursor-pointer"
            >
              <v-card-title class="text-h5">{{ type.name }}</v-card-title>
              <v-card-subtitle class="text-h6 mt-2">
                {{ formatCurrency(type.fee) }}
              </v-card-subtitle>
              <v-card-text>
                <div class="d-flex align-center justify-space-between">
                  <span>Members: {{ memberCount(type.id) }}</span>
                  <v-icon>mdi-arrow-right</v-icon>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Member Details Dialog -->
        <v-dialog v-model="showMemberDetailsDialog" max-width="1400px" scrollable>
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="text-h5">{{ selectedMembershipType?.name }} Members</span>
              <div>
                <v-btn 
                  color="primary" 
                  @click="openAddMemberDialog"
                  prepend-icon="mdi-plus"
                >
                  Add Member
                </v-btn>
                <v-btn 
                  icon="mdi-close" 
                  variant="text"
                  @click="showMemberDetailsDialog = false"
                  class="ml-2"
                ></v-btn>
              </div>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text style="max-height: 600px;">
              <v-data-table
                :headers="[
                  { title: 'Name', key: 'name', sortable: true },
                  { title: 'Date Joined', key: 'date_joined', sortable: true },
                  { title: 'Membership Fee', key: 'membership', sortable: false },
                  { title: 'Payment Status', key: 'status', sortable: false },
                  { title: 'Balance', key: 'balance', sortable: false },
                  { title: 'CBU', key: 'cbu', sortable: true },
                  { title: 'Management Fee', key: 'management_fee', sortable: true },
                  { title: 'Monthly Dues', key: 'monthly_dues', sortable: true },
                  { title: 'Daily Dues', key: 'daily_dues', sortable: true },
                  { title: 'Actions', key: 'actions', sortable: false }
                ]"
                :items="filteredMembers"
                :loading="loading"
                item-value="id"
                class="elevation-1"
              >
                <template v-slot:item.membership="{ item }">
                  <div>
                    <div>{{ formatCurrency(getTotalPaid(item)) }} / {{ formatCurrency(getMembershipFee(item)) }}</div>
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

                <template v-slot:item.cbu="{ item }">
                  {{ formatCurrency(item.cbu) }}
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
                  <v-btn
                    v-if="getBalance(item) > 0"
                    color="primary"
                    size="small"
                    variant="tonal"
                    @click="openPaymentDialog(item)"
                  >
                    Add Payment
                  </v-btn>
                  <v-chip v-else color="success" size="small">Paid in Full</v-chip>
                </template>

                <template v-slot:no-data>
                  <div class="text-center pa-4">
                    <p class="text-h6 mb-2">No members yet</p>
                    <p class="text-body-2 text-medium-emphasis">Click "Add Member" to get started</p>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Add Member Dialog -->
        <v-dialog v-model="showAddMemberDialog" max-width="600px">
          <v-card>
            <v-card-title>
              <span class="text-h5">Add New Member - {{ selectedMembershipType?.name }}</span>
            </v-card-title>

            <v-card-text>
              <!-- Display selected membership type info -->
              <v-alert 
                type="info" 
                variant="tonal" 
                class="mb-4"
              >
                <div class="d-flex justify-space-between align-center">
                  <span>Membership Type: <strong>{{ selectedMembershipType?.name }}</strong></span>
                  <span>Fee: <strong>{{ formatCurrency(selectedMembershipType?.fee || 0) }}</strong></span>
                </div>
              </v-alert>

              <v-form @submit.prevent="addMember">
                <v-text-field
                  v-model="newMember.name"
                  label="Member Name*"
                  required
                  :disabled="loading"
                ></v-text-field>

                <v-text-field
                  v-model.number="newMember.initial_payment"
                  label="Initial Payment"
                  type="number"
                  prefix="₱"
                  hint="Leave as 0 if no initial payment"
                  :disabled="loading"
                ></v-text-field>

                <v-divider class="my-4"></v-divider>

                <v-text-field
                  v-model.number="newMember.cbu"
                  label="Capital Build Up (CBU)"
                  type="number"
                  prefix="₱"
                  :disabled="loading"
                ></v-text-field>

                <v-text-field
                  v-model.number="newMember.management_fee"
                  label="Management Fee"
                  type="number"
                  prefix="₱"
                  :disabled="loading"
                ></v-text-field>

                <v-text-field
                  v-model.number="newMember.monthly_dues"
                  label="Monthly Dues"
                  type="number"
                  prefix="₱"
                  :disabled="loading"
                ></v-text-field>

                <v-text-field
                  v-model.number="newMember.daily_dues"
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
                @click="showAddMemberDialog = false"
                :disabled="loading"
              >
                Cancel
              </v-btn>
              <v-btn 
                color="primary" 
                variant="elevated" 
                @click="addMember"
                :loading="loading"
              >
                Add Member
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Add Payment Dialog -->
        <v-dialog v-model="showPaymentDialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="text-h5">Add Payment</span>
            </v-card-title>

            <v-card-text v-if="selectedMember">
              <p><strong>Member:</strong> {{ selectedMember.name }}</p>
              <p><strong>Membership Type:</strong> {{ selectedMember.membership_type?.name }}</p>
              <p><strong>Total Paid:</strong> {{ formatCurrency(getTotalPaid(selectedMember)) }}</p>
              <p><strong>Balance:</strong> {{ formatCurrency(getBalance(selectedMember)) }}</p>

              <v-divider class="my-4"></v-divider>

              <v-form @submit.prevent="addPayment">
                <v-text-field
                  v-model.number="newPaymentAmount"
                  label="Payment Amount*"
                  type="number"
                  prefix="₱"
                  required
                  :disabled="loading"
                ></v-text-field>

                <v-textarea
                  v-model="paymentNotes"
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
                @click="showPaymentDialog = false"
                :disabled="loading"
              >
                Cancel
              </v-btn>
              <v-btn 
                color="primary" 
                variant="elevated" 
                @click="addPayment"
                :loading="loading"
              >
                Record Payment
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>