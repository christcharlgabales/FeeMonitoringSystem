import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useToast } from 'vue-toastification'

export interface MembershipType {
  id: string
  name: string
  fee: number
  color: string
}

export interface Payment {
  id: string
  member_id: string
  amount: number
  payment_date: string
  notes?: string
}

export interface Member {
  id: string
  name: string
  membership_type_id: string
  membership_type?: MembershipType
  cbu: number
  management_fee: number
  monthly_dues: number
  daily_dues: number
  date_joined: string
  payments?: Payment[]
}

export const useMembers = () => {
  const toast = useToast()

  const members = ref<Member[]>([])
  const membershipTypes = ref<MembershipType[]>([])
  const loading = ref(false)

  // Fetch all membership types
  const fetchMembershipTypes = async () => {
    try {
      loading.value = true
      const { data, error } = await supabase
        .from('membership_types')
        .select('*')
        .order('name')

      if (error) throw error
      membershipTypes.value = data || []
    } catch (error: any) {
      toast.error('Failed to load membership types: ' + error.message)
      console.error('Error fetching membership types:', error)
    } finally {
      loading.value = false
    }
  }

  // Fetch all members with their membership types and payments
  const fetchMembers = async () => {
    try {
      loading.value = true
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          membership_type:membership_types(*),
          payments(*)
        `)
        .order('name')

      if (error) throw error
      members.value = data || []
    } catch (error: any) {
      toast.error('Failed to load members: ' + error.message)
      console.error('Error fetching members:', error)
    } finally {
      loading.value = false
    }
  }

  // Add a new member
  const addMember = async (memberData: {
    name: string
    membership_type_id: string
    initial_payment?: number
    cbu?: number
    management_fee?: number
    monthly_dues?: number
    daily_dues?: number
  }) => {
    try {
      loading.value = true

      // Insert member
      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert({
          name: memberData.name,
          membership_type_id: memberData.membership_type_id,
          cbu: memberData.cbu || 0,
          management_fee: memberData.management_fee || 0,
          monthly_dues: memberData.monthly_dues || 0,
          daily_dues: memberData.daily_dues || 0
        })
        .select()
        .single()

      if (memberError) throw memberError

      // Add initial payment if provided
      if (memberData.initial_payment && memberData.initial_payment > 0) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            member_id: member.id,
            amount: memberData.initial_payment,
            notes: 'Initial payment'
          })

        if (paymentError) throw paymentError
      }

      toast.success('Member added successfully')
      await fetchMembers() // Refresh the list
      return { success: true, data: member }
    } catch (error: any) {
      toast.error('Failed to add member: ' + error.message)
      console.error('Error adding member:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // Add payment to a member
  const addPayment = async (memberId: string, amount: number, notes?: string) => {
    try {
      loading.value = true

      const { data, error } = await supabase
        .from('payments')
        .insert({
          member_id: memberId,
          amount,
          notes
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Payment recorded successfully')
      await fetchMembers() // Refresh the list
      return { success: true, data }
    } catch (error: any) {
      toast.error('Failed to record payment: ' + error.message)
      console.error('Error adding payment:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // Update member details
  const updateMember = async (memberId: string, updates: Partial<Member>) => {
    try {
      loading.value = true

      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', memberId)
        .select()
        .single()

      if (error) throw error

      toast.success('Member updated successfully')
      await fetchMembers()
      return { success: true, data }
    } catch (error: any) {
      toast.error('Failed to update member: ' + error.message)
      console.error('Error updating member:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // Delete a member
  const deleteMember = async (memberId: string) => {
    try {
      loading.value = true

      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      toast.success('Member deleted successfully')
      await fetchMembers()
      return { success: true }
    } catch (error: any) {
      toast.error('Failed to delete member: ' + error.message)
      console.error('Error deleting member:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // Helper functions
  const getTotalPaid = (member: Member): number => {
    if (!member.payments) return 0
    return member.payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
  }

  const getMembershipFee = (member: Member): number => {
    return member.membership_type ? Number(member.membership_type.fee) : 0
  }

  const getBalance = (member: Member): number => {
    const totalPaid = getTotalPaid(member)
    const requiredFee = getMembershipFee(member)
    return Math.max(0, requiredFee - totalPaid)
  }

  const getPaymentStatus = (member: Member) => {
    const totalPaid = getTotalPaid(member)
    const requiredFee = getMembershipFee(member)

    if (totalPaid >= requiredFee) {
      return { status: 'Full', color: 'success', percentage: 100 }
    } else {
      const percentage = requiredFee > 0 ? (totalPaid / requiredFee) * 100 : 0
      return {
        status: 'Partial',
        color: 'warning',
        percentage: Math.round(percentage)
      }
    }
  }

  return {
    members,
    membershipTypes,
    loading,
    fetchMembershipTypes,
    fetchMembers,
    addMember,
    addPayment,
    updateMember,
    deleteMember,
    getTotalPaid,
    getMembershipFee,
    getBalance,
    getPaymentStatus
  }
}