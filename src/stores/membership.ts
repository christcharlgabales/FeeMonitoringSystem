import { defineStore } from 'pinia'
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

export const useMembershipStore = defineStore('membership', () => {
  const toast = useToast()

  // State
  const members = ref<Member[]>([])
  const membershipTypes = ref<MembershipType[]>([])
  const loading = ref(false)

  // Computed
  const getMembersByType = computed(() => {
    return (typeId: string) => members.value.filter(m => m.membership_type_id === typeId)
  })

  const getMemberCount = computed(() => {
    return (typeId: string) => members.value.filter(m => m.membership_type_id === typeId).length
  })

  // Actions - Fetch
  async function fetchMembershipTypes() {
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

  async function fetchMembers() {
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

    if (data) {
      // Filter out deleted payments and sort
      data.forEach(member => {
        console.log(`Member ${member.name} CBU from DB:`, member.cbu)
        
        if (member.payments) {
          member.payments = member.payments
            .filter((p: Payment) => !p.is_deleted)
            .sort((a: Payment, b: Payment) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
        }
      })
    }

    members.value = data || []
    console.log('📊 Members updated:', members.value.length)
  } catch (error: any) {
    toast.error('Failed to load members: ' + error.message)
    console.error('Error fetching members:', error)
  } finally {
    loading.value = false
  }
}

  async function fetchPaymentHistory(memberId: string) {
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

  // Actions - Create
  async function addMember(memberData: {
    name: string
    membership_type_id: string
    initial_payment?: number
    cbu?: number
    management_fee?: number
    monthly_dues?: number
    daily_dues?: number
  }) {
    try {
      loading.value = true

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
      await fetchMembers()
      return { success: true, data: member }
    } catch (error: any) {
      toast.error('Failed to add member: ' + error.message)
      console.error('Error adding member:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  async function addPayment(
  memberId: string,
  amount: number,
  paymentType: 'membership' | 'monthly_dues' | 'daily_dues' | 'cbu' = 'membership',
  notes?: string
) {
  try {
    loading.value = true

    const member = members.value.find(m => m.id === memberId)
    
    console.log('🔍 Payment Details:', {
      memberId,
      amount,
      paymentType,
      membershipName: member?.membership_type?.name,
      currentCBU: member?.cbu
    })

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

    // Handle CBU and column updates
    if (member?.membership_type) {
      const membershipName = member.membership_type.name
      const shouldAffectCBU = membershipName === 'Tourist VISMIN' || 
                              membershipName === 'UVE' || 
                              membershipName === 'PUJ'
      
      console.log('💰 CBU Check:', {
        membershipName,
        shouldAffectCBU,
        paymentType,
        willUpdateCBU: paymentType === 'cbu' || (paymentType === 'monthly_dues' && shouldAffectCBU)
      })

      // Prepare updates object
      const memberUpdates: any = {}

      // Handle monthly_dues
      if (paymentType === 'monthly_dues') {
        const currentMonthlyDues = member.monthly_dues || 0
        memberUpdates.monthly_dues = currentMonthlyDues + amount
        
        // Also update CBU if applicable
        if (shouldAffectCBU) {
          const currentCBU = member.cbu || 0
          memberUpdates.cbu = currentCBU + amount
        }
      }
      // Handle daily_dues
      else if (paymentType === 'daily_dues') {
        const currentDailyDues = member.daily_dues || 0
        memberUpdates.daily_dues = currentDailyDues + amount
      }
      // Handle direct CBU payment
      else if (paymentType === 'cbu') {
        const currentCBU = member.cbu || 0
        memberUpdates.cbu = currentCBU + amount
      }

      // Apply updates if there are any
      if (Object.keys(memberUpdates).length > 0) {
        console.log('✅ Updating member columns:', memberUpdates)
        
        const { error: updateError } = await supabase
          .from('members')
          .update(memberUpdates)
          .eq('id', memberId)

        if (updateError) {
          console.error('❌ Member Update Error:', updateError)
          throw updateError
        }
        
        console.log('✅ Member updated successfully')
      } else {
        console.log('⏭️ No member column updates needed')
      }
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

  // Actions - Update
  async function editPayment(
    paymentId: string,
    updates: {
      amount?: number
      payment_type?: 'membership' | 'monthly_dues' | 'daily_dues' | 'cbu'
      payment_date?: string
      notes?: string
    }
  ) {
    try {
      loading.value = true

      // First, fetch the original payment (without joins to avoid complexity)
      const { data: originalPayment, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .eq('is_deleted', false)
        .single()

      if (fetchError) throw fetchError
      if (!originalPayment) throw new Error('Payment not found')

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

      // Fetch member data separately to get membership type info
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id, cbu, monthly_dues, daily_dues, membership_types(name)')
        .eq('id', originalPayment.member_id)
        .single()

      if (memberError) throw memberError

      // Handle CBU adjustments if member has relevant membership type
      if (memberData?.membership_types) {
        // Handle both array and single object response from Supabase
        const membershipTypeData = memberData.membership_types as any
        const membershipName = Array.isArray(membershipTypeData) 
          ? membershipTypeData[0]?.name 
          : membershipTypeData?.name
        
        if (!membershipName) {
          console.warn('No membership type name found')
          toast.success('Payment updated successfully')
          await fetchMembers()
          return { success: true, data }
        }
        const shouldAffectCBU = membershipName === 'Tourist VISMIN' || 
                        membershipName === 'UVE' || 
                        membershipName === 'PUJ'

        const memberUpdates: any = {}

        // Reverse old payment effects
        if (oldType === 'monthly_dues') {
          const currentMonthlyDues = memberData.monthly_dues || 0
          memberUpdates.monthly_dues = currentMonthlyDues - oldAmount
          
          if (shouldAffectCBU) {
            const currentCBU = memberData.cbu || 0
            memberUpdates.cbu = (memberUpdates.cbu || currentCBU) - oldAmount
          }
        } else if (oldType === 'daily_dues') {
          const currentDailyDues = memberData.daily_dues || 0
          memberUpdates.daily_dues = currentDailyDues - oldAmount
        } else if (oldType === 'cbu') {
          const currentCBU = memberData.cbu || 0
          memberUpdates.cbu = (memberUpdates.cbu || currentCBU) - oldAmount
        }

        // Apply new payment effects
        if (newType === 'monthly_dues') {
          const currentMonthlyDues = memberUpdates.monthly_dues ?? memberData.monthly_dues ?? 0
          memberUpdates.monthly_dues = currentMonthlyDues + newAmount
          
          if (shouldAffectCBU) {
            const currentCBU = memberUpdates.cbu ?? memberData.cbu ?? 0
            memberUpdates.cbu = currentCBU + newAmount
          }
        } else if (newType === 'daily_dues') {
          const currentDailyDues = memberUpdates.daily_dues ?? memberData.daily_dues ?? 0
          memberUpdates.daily_dues = currentDailyDues + newAmount
        } else if (newType === 'cbu') {
          const currentCBU = memberUpdates.cbu ?? memberData.cbu ?? 0
          memberUpdates.cbu = currentCBU + newAmount
        }

        // Apply updates if there are any
        if (Object.keys(memberUpdates).length > 0) {
          console.log('💰 Member Column Adjustments on Edit:', {
            oldType,
            oldAmount,
            newType,
            newAmount,
            updates: memberUpdates
          })
          
          const { error: updateError } = await supabase
            .from('members')
            .update(memberUpdates)
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

  async function updateMember(memberId: string, updates: Partial<Member>) {
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

  // Actions - Delete
  async function deletePayment(paymentId: string) {
    try {
      loading.value = true

      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('*, members!inner(membership_type_id, cbu, monthly_dues, daily_dues, membership_types(*))')
        .eq('id', paymentId)
        .single()

      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('payments')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', paymentId)

      if (error) throw error

      const memberData = payment.members

      if (memberData?.membership_types) {
        const membershipName = memberData.membership_types.name
        const shouldAffectCBU = membershipName === 'Tourist VISMIN' || 
                        membershipName === 'UVE' || 
                        membershipName === 'PUJ'

        const memberUpdates: any = {}

        // Handle reversal based on payment type
        if (payment.payment_type === 'monthly_dues') {
          const currentMonthlyDues = memberData.monthly_dues || 0
          memberUpdates.monthly_dues = Math.max(0, currentMonthlyDues - payment.amount)
          
          if (shouldAffectCBU) {
            const currentCBU = memberData.cbu || 0
            memberUpdates.cbu = Math.max(0, currentCBU - payment.amount)
          }
        } else if (payment.payment_type === 'daily_dues') {
          const currentDailyDues = memberData.daily_dues || 0
          memberUpdates.daily_dues = Math.max(0, currentDailyDues - payment.amount)
        } else if (payment.payment_type === 'cbu') {
          const currentCBU = memberData.cbu || 0
          memberUpdates.cbu = Math.max(0, currentCBU - payment.amount)
        }

        // Apply updates if there are any
        if (Object.keys(memberUpdates).length > 0) {
          const { error: updateError } = await supabase
            .from('members')
            .update(memberUpdates)
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

  async function deleteMember(memberId: string) {
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

  return {
    // State
    members,
    membershipTypes,
    loading,

    // Computed
    getMembersByType,
    getMemberCount,

    // Actions
    fetchMembershipTypes,
    fetchMembers,
    fetchPaymentHistory,
    addMember,
    addPayment,
    editPayment,
    updateMember,
    deletePayment,
    deleteMember
  }
})