import { ref } from 'vue'
import type { Member, MembershipType, Payment } from '@/stores/membership'

export const useMembershipDialogs = () => {
  // Dialog states
  const showAddMemberDialog = ref(false)
  const showMemberDetailsDialog = ref(false)
  const showPaymentDialog = ref(false)
  const showPaymentHistoryDialog = ref(false)
  const showEditPaymentDialog = ref(false)
  const showDeleteConfirmDialog = ref(false)

  // Selected items
  const selectedMembershipType = ref<MembershipType | null>(null)
  const selectedMember = ref<Member | null>(null)
  const selectedPayment = ref<Payment | null>(null)
  const paymentHistory = ref<Payment[]>([])

  // Form data
  const newMemberForm = ref({
    name: '',
    initial_payment: 0,
    cbu: 0,
    management_fee: 0,
    monthly_dues: 0,
    daily_dues: 0
  })

  const paymentForm = ref({
    type: 'membership' as 'membership' | 'monthly_dues' | 'daily_dues' | 'cbu',
    amount: 0,
    notes: ''
  })

  const editPaymentForm = ref({
    type: 'membership' as 'membership' | 'monthly_dues' | 'daily_dues' | 'cbu',
    amount: 0,
    payment_date: '',
    notes: ''
  })

  // Actions
  const openMemberDetailsDialog = (type: MembershipType) => {
    selectedMembershipType.value = type
    showMemberDetailsDialog.value = true
  }

  const openAddMemberDialog = () => {
    newMemberForm.value = {
      name: '',
      initial_payment: 0,
      cbu: 0,
      management_fee: 0,
      monthly_dues: 0,
      daily_dues: 0
    }
    showAddMemberDialog.value = true
  }

  const openPaymentDialog = (member: Member) => {
    selectedMember.value = member
    paymentForm.value = {
      type: 'membership',
      amount: 0,
      notes: ''
    }
    showPaymentDialog.value = true
  }

  const openPaymentHistoryDialog = (member: Member, history: Payment[]) => {
    selectedMember.value = member
    paymentHistory.value = history
    showPaymentHistoryDialog.value = true
  }

  const openEditPaymentDialog = (payment: Payment) => {
    selectedPayment.value = payment
    editPaymentForm.value = {
      type: payment.payment_type,
      amount: Number(payment.amount),
      payment_date: payment.payment_date,
      notes: payment.notes || ''
    }
    showEditPaymentDialog.value = true
  }

  const openDeleteConfirmDialog = (payment: Payment) => {
    selectedPayment.value = payment
    showDeleteConfirmDialog.value = true
  }

  const closeAllDialogs = () => {
    showAddMemberDialog.value = false
    showMemberDetailsDialog.value = false
    showPaymentDialog.value = false
    showPaymentHistoryDialog.value = false
    showEditPaymentDialog.value = false
    showDeleteConfirmDialog.value = false
  }

  return {
    // Dialog states
    showAddMemberDialog,
    showMemberDetailsDialog,
    showPaymentDialog,
    showPaymentHistoryDialog,
    showEditPaymentDialog,
    showDeleteConfirmDialog,

    // Selected items
    selectedMembershipType,
    selectedMember,
    selectedPayment,
    paymentHistory,

    // Forms
    newMemberForm,
    paymentForm,
    editPaymentForm,

    // Actions
    openMemberDetailsDialog,
    openAddMemberDialog,
    openPaymentDialog,
    openPaymentHistoryDialog,
    openEditPaymentDialog,
    openDeleteConfirmDialog,
    closeAllDialogs
  }
}