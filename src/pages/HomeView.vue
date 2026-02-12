<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import InnerLayoutWrapper from '@/layouts/InnerLayoutWrapper.vue'
import { useMembershipStore } from '@/stores/membership'
import { useMembershipDialogs } from '@/pages/admin/composables/useMembershipDialogs'
import { getBalance, formatCurrency } from '@/utils/membershipHelpers'

import MembershipTypeCard from '@/pages/admin/components/membership/MembershipTypeCard.vue'
import MemberDetailsTable from '@/pages/admin/components/membership/MemberDetailsTable.vue'
import AddMemberDialog from '@/pages/admin/components/membership/dialogs/AddMemberDialog.vue'
import AddPaymentDialog from '@/pages/admin/components/membership/dialogs/AddPaymentDialog.vue'
import PaymentHistoryDialog from '@/pages/admin/components/membership/dialogs/PaymentHistoryDialog.vue'
import EditPaymentDialog from '@/pages/admin/components/membership/dialogs/EditPaymentDialog.vue'
import DeletePaymentDialog from '@/pages/admin/components/membership/dialogs/DeletePaymentDialog.vue'
import SearchBar from '@/pages/admin/components/SearchBar.vue'

const toast = useToast()
const membershipStore = useMembershipStore()
const {
  showAddMemberDialog,
  showMemberDetailsDialog,
  showPaymentDialog,
  showPaymentHistoryDialog,
  showEditPaymentDialog,
  showDeleteConfirmDialog,
  selectedMembershipType,
  selectedMember,
  selectedPayment,
  paymentHistory,
  newMemberForm,
  paymentForm,
  editPaymentForm,
  openMemberDetailsDialog,
  openAddMemberDialog,
  openPaymentDialog,
  openPaymentHistoryDialog,
  openEditPaymentDialog,
  openDeleteConfirmDialog
} = useMembershipDialogs()

const { members, membershipTypes, loading } = storeToRefs(membershipStore)

// Search functionality
const searchQuery = ref('')

// Computed
const filteredMembers = computed(() => {
  if (!selectedMembershipType.value) return []
  
  let membersList = membershipStore.getMembersByType(selectedMembershipType.value.id)
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    membersList = membersList.filter(member => 
      member.name.toLowerCase().includes(query)
    )
  }
  
  return membersList
})

const showCBUNote = computed(() => {
  if (!selectedMember.value?.membership_type) return false
  const membershipName = selectedMember.value.membership_type.name
  return paymentForm.value.type === 'monthly_dues' &&
    (membershipName === 'Tourist VISMIN' || membershipName === 'UVE' || membershipName === 'PUJ')
})

// Methods
const handleOpenMemberDetailsDialog = (type: any) => {
  searchQuery.value = '' // Reset search when opening dialog
  openMemberDetailsDialog(type)
}

const handleAddMember = async () => {
  if (!newMemberForm.value.name || !selectedMembershipType.value) {
    toast.error('Please fill in the member name')
    return
  }

  const result = await membershipStore.addMember({
    name: newMemberForm.value.name,
    membership_type_id: selectedMembershipType.value.id,
    initial_payment: newMemberForm.value.initial_payment,
    cbu: newMemberForm.value.cbu,
    management_fee: newMemberForm.value.management_fee,
    monthly_dues: newMemberForm.value.monthly_dues,
    daily_dues: newMemberForm.value.daily_dues
  })

  if (result.success) {
    showAddMemberDialog.value = false
  }
}

const handleAddPayment = async () => {
  if (!selectedMember.value || paymentForm.value.amount <= 0) {
    toast.error('Please enter a valid payment amount')
    return
  }

  if (paymentForm.value.type === 'membership') {
    const balance = getBalance(selectedMember.value)
    if (paymentForm.value.amount > balance && balance > 0) {
      const confirmExceed = confirm(
        `Warning: Payment amount (${formatCurrency(paymentForm.value.amount)}) exceeds the remaining balance (${formatCurrency(balance)}).\n\nDo you want to continue?`
      )
      if (!confirmExceed) return
    }
  }

  const result = await membershipStore.addPayment(
    selectedMember.value.id,
    paymentForm.value.amount,
    paymentForm.value.type,
    paymentForm.value.notes || undefined
  )

  if (result.success) {
    showPaymentDialog.value = false
  }
}

const handleViewHistory = async (member: typeof selectedMember.value) => {
  if (!member) return
  const result = await membershipStore.fetchPaymentHistory(member.id)
  if (result.success) {
    openPaymentHistoryDialog(member, result.data)
  }
}

const handleEditPayment = async () => {
  if (!selectedPayment.value || editPaymentForm.value.amount <= 0) {
    toast.error('Please enter a valid payment amount')
    return
  }

  const result = await membershipStore.editPayment(selectedPayment.value.id, {
    amount: editPaymentForm.value.amount,
    payment_type: editPaymentForm.value.type,
    payment_date: editPaymentForm.value.payment_date,
    notes: editPaymentForm.value.notes || undefined
  })

  if (result.success) {
    showEditPaymentDialog.value = false
    if (selectedMember.value) {
      await handleViewHistory(selectedMember.value)
    }
  }
}

const handleDeletePayment = async () => {
  if (!selectedPayment.value) return

  const result = await membershipStore.deletePayment(selectedPayment.value.id)

  if (result.success) {
    showDeleteConfirmDialog.value = false
    if (selectedMember.value) {
      await handleViewHistory(selectedMember.value)
    }
  }
}

onMounted(async () => {
  await membershipStore.fetchMembershipTypes()
  await membershipStore.fetchMembers()
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
            <MembershipTypeCard
              :membership-type="type"
              :member-count="membershipStore.getMemberCount(type.id)"
              @click="handleOpenMemberDetailsDialog(type)"
            />
          </v-col>
        </v-row>

        <!-- Member Details Dialog -->
        <v-dialog v-model="showMemberDetailsDialog" max-width="1600px" scrollable>
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

            <!-- Search Bar -->
            <v-card-text class="pb-0">
              <v-row>
                <v-col cols="12" md="6" class="mx-auto">
                  <SearchBar v-model="searchQuery" />
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-text style="max-height: 600px;">
              <!-- No Results Message -->
              <v-alert
                v-if="filteredMembers.length === 0 && searchQuery"
                type="info"
                variant="tonal"
                class="mb-4"
              >
                No members found matching "{{ searchQuery }}"
              </v-alert>

              <MemberDetailsTable
                :members="filteredMembers"
                :loading="loading"
                @add-payment="openPaymentDialog"
                @view-history="handleViewHistory"
              />
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Dialogs -->
        <AddMemberDialog
          v-model="showAddMemberDialog"
          :membership-type="selectedMembershipType"
          :loading="loading"
          :form="newMemberForm"
          @submit="handleAddMember"
        />

        <AddPaymentDialog
          v-model="showPaymentDialog"
          :member="selectedMember"
          :loading="loading"
          :form="paymentForm"
          :show-c-b-u-note="showCBUNote"
          @submit="handleAddPayment"
        />

        <PaymentHistoryDialog
          v-model="showPaymentHistoryDialog"
          :member="selectedMember"
          :payments="paymentHistory"
          @edit-payment="openEditPaymentDialog"
          @delete-payment="openDeleteConfirmDialog"
        />

        <EditPaymentDialog
          v-model="showEditPaymentDialog"
          :loading="loading"
          :form="editPaymentForm"
          @submit="handleEditPayment"
        />

        <DeletePaymentDialog
          v-model="showDeleteConfirmDialog"
          :loading="loading"
          :payment="selectedPayment"
          @confirm="handleDeletePayment"
        />
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>