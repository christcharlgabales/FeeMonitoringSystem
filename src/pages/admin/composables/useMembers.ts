
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useToast } from 'vue-toastification'

export interface MembershipType {
  id: string
  name: string
  fee: number
  color: string
  cbu_target: number
}

export interface Payment {
  id: string
  member_id: string
  amount: number
  payment_date: string
  payment_type: 'membership' | 'monthly_dues' | 'daily_dues' | 'cbu'
  notes?: string
  created_at: string
  edited_at?: string
  is_deleted?: boolean
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
          payments!inner(*)
        `)
        .eq('payments.is_deleted', false)
        .order('name')

      if (error) throw error
      
      // Sort payments by created_at descending (most recent first)
      if (data) {
        data.forEach(member => {
          if (member.payments) {
            member.payments.sort((a: Payment, b: Payment) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          }
        })
      }
      
      members.value = data || []
    } catch (error: any) {
      toast.error('Failed to load members: ' + error.message)
      console.error('Error fetching members:', error)
    } finally {
      loading.value = false
    }
  }

  // Fetch payment history for a specific member
  const fetchPaymentHistory = async (memberId: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', memberId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error: any) {
      toast.error('Failed to load payment history: ' + error.message)
      console.error('Error fetching payment history:', error)
      return { success: false, error, data: [] }
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
            payment_type: 'membership',
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
  const addPayment = async (
    memberId: string, 
    amount: number, 
    paymentType: 'membership' | 'monthly_dues' | 'daily_dues' | 'cbu' = 'membership',
    notes?: string
  ) => {
    try {
      loading.value = true

      // Find the member to check membership type
      const member = members.value.find(m => m.id === memberId)
      
      // Insert payment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          member_id: memberId,
          amount,
          payment_type: paymentType,
          notes
        })
        .select()
        .single()

      if (paymentError) throw paymentError

      // If it's monthly_dues payment for Tourist VISMIN or UVE, also add to CBU
      if (paymentType === 'monthly_dues' && member?.membership_type) {
        if (member.membership_type.name === 'Tourist VISMIN' || member.membership_type.name === 'UVE') {
          // Update the member's CBU
          const currentCBU = member.cbu || 0
          const { error: updateError } = await supabase
            .from('members')
            .update({ cbu: currentCBU + amount })
            .eq('id', memberId)

          if (updateError) throw updateError
        }
      }

      // If it's a direct CBU payment, update the member's CBU
      if (paymentType === 'cbu') {
        const currentCBU = member?.cbu || 0
        const { error: updateError } = await supabase
          .from('members')
          .update({ cbu: currentCBU + amount })
          .eq('id', memberId)

        if (updateError) throw updateError
      }

      toast.success('Payment recorded successfully')
      await fetchMembers() // Refresh the list
      return { success: true, data: payment }
    } catch (error: any) {
      toast.error('Failed to record payment: ' + error.message)
      console.error('Error adding payment:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // Edit a payment
  const editPayment = async (
    paymentId: string,
    updates: {
      amount?: number
      payment_type?: 'membership' | 'monthly_dues' | 'daily_dues' | 'cbu'
      payment_date?: string
      notes?: string
    }
  ) => {
    try {
      loading.value = true

      // Get the original payment first
      const { data: originalPayment, error: fetchError } = await supabase
        .from('payments')
        .select('*, members!inner(membership_type_id, cbu, membership_types(*))')
        .eq('id', paymentId)
        .single()

      if (fetchError) throw fetchError

      const oldAmount = originalPayment.amount
      const oldType = originalPayment.payment_type
      const newAmount = updates.amount ?? oldAmount
      const newType = updates.payment_type ?? oldType

      // Update the payment
      const { data, error } = await supabase
        .from('payments')
        .update({
          ...updates,
          edited_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single()

      if (error) throw error

      // Handle CBU adjustments if needed
      const memberData = originalPayment.members
      
      if (memberData?.membership_types) {
        const membershipName = memberData.membership_types.name
        const shouldAffectCBU = membershipName === 'Tourist VISMIN' || membershipName === 'UVE'

        // Calculate CBU adjustment
        let cbuAdjustment = 0

        // Remove old CBU contribution
        if ((oldType === 'monthly_dues' && shouldAffectCBU) || oldType === 'cbu') {
          cbuAdjustment -= oldAmount
        }

        // Add new CBU contribution
        if ((newType === 'monthly_dues' && shouldAffectCBU) || newType === 'cbu') {
          cbuAdjustment += newAmount
        }

        // Update member's CBU if there's a change
        if (cbuAdjustment !== 0) {
          const currentCBU = memberData.cbu || 0
          const { error: updateError } = await supabase
            .from('members')
            .update({ cbu: currentCBU + cbuAdjustment })
            .eq('id', originalPayment.member_id)

          if (updateError) throw updateError
        }
      }

      toast.success('Payment updated successfully')
      await fetchMembers()
      return { success: true, data }
    } catch (error: any) {
      toast.error('Failed to update payment: ' + error.message)
      console.error('Error updating payment:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // Delete a payment (soft delete)
  const deletePayment = async (paymentId: string) => {
    try {
      loading.value = true

      // Get the payment first to adjust CBU if needed
      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('*, members!inner(membership_type_id, cbu, membership_types(*))')
        .eq('id', paymentId)
        .single()

      if (fetchError) throw fetchError

      // Mark as deleted (soft delete)
      const { error } = await supabase
        .from('payments')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', paymentId)

      if (error) throw error

      // Adjust CBU if this was a CBU-related payment
      const memberData = payment.members
      
      if (memberData?.membership_types) {
        const membershipName = memberData.membership_types.name
        const shouldAffectCBU = membershipName === 'Tourist VISMIN' || membershipName === 'UVE'

        if ((payment.payment_type === 'monthly_dues' && shouldAffectCBU) || payment.payment_type === 'cbu') {
          const currentCBU = memberData.cbu || 0
          const { error: updateError } = await supabase
            .from('members')
            .update({ cbu: Math.max(0, currentCBU - payment.amount) })
            .eq('id', payment.member_id)

          if (updateError) throw updateError
        }
      }

      toast.success('Payment deleted successfully')
      await fetchMembers()
      return { success: true }
    } catch (error: any) {
      toast.error('Failed to delete payment: ' + error.message)
      console.error('Error deleting payment:', error)
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
  const getTotalPaid = (member: Member, paymentType?: string): number => {
    if (!member.payments) return 0
    if (paymentType) {
      return member.payments
        .filter(p => p.payment_type === paymentType)
        .reduce((sum, payment) => sum + Number(payment.amount), 0)
    }
    return member.payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
  }

  const getMembershipFee = (member: Member): number => {
    return member.membership_type ? Number(member.membership_type.fee) : 0
  }

  const getCBUTarget = (member: Member): number => {
    return member.membership_type ? Number(member.membership_type.cbu_target) : 0
  }

  const getCBUBalance = (member: Member): number => {
    const target = getCBUTarget(member)
    const current = Number(member.cbu) || 0
    return Math.max(0, target - current)
  }

  const getBalance = (member: Member): number => {
    const totalPaid = getTotalPaid(member, 'membership')
    const requiredFee = getMembershipFee(member)
    return Math.max(0, requiredFee - totalPaid)
  }

  const getPaymentStatus = (member: Member) => {
    const totalPaid = getTotalPaid(member, 'membership')
    const requiredFee = getMembershipFee(member)

    if (totalPaid >= requiredFee) {
      return { status: 'Full', color: 'success', percentage: 100 }
    } else {
      const percentage = requiredFee > 0 ? (totalPaid / requiredFee) * 100 : 0
      return {
        status: 'Partial',
        color: 'info',
        percentage: Math.round(percentage)
      }
    }
  }

  const getCBUStatus = (member: Member) => {
    const current = Number(member.cbu) || 0
    const target = getCBUTarget(member)

    if (current >= target) {
      return { status: 'Complete', color: 'success', percentage: 100 }
    } else {
      const percentage = target > 0 ? (current / target) * 100 : 0
      return {
        status: 'In Progress',
        color: 'info',
        percentage: Math.round(percentage)
      }
    }
  }

  const getPaymentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      membership: 'Membership Fee',
      monthly_dues: 'Monthly Dues',
      daily_dues: 'Daily Dues',
      cbu: 'CBU'
    }
    return labels[type] || type
  }

  return {
    members,
    membershipTypes,
    loading,
    fetchMembershipTypes,
    fetchMembers,
    fetchPaymentHistory,
    addMember,
    addPayment,
    editPayment,
    deletePayment,
    updateMember,
    deleteMember,
    getTotalPaid,
    getMembershipFee,
    getCBUTarget,
    getCBUBalance,
    getBalance,
    getPaymentStatus,
    getCBUStatus,
    getPaymentTypeLabel
  }
}