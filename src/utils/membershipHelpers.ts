import type { Member } from '@/stores/membership'

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount)
}

export const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(dateString))
}

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateString))
}

export const getTotalPaid = (member: Member, paymentType?: string): number => {
  if (!member.payments) return 0
  if (paymentType) {
    return member.payments
      .filter(p => p.payment_type === paymentType)
      .reduce((sum, payment) => sum + Number(payment.amount), 0)
  }
  return member.payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
}

export const getMembershipFee = (member: Member): number => {
  return member.membership_type ? Number(member.membership_type.fee) : 0
}

export const getCBUTarget = (member: Member): number => {
  return member.membership_type ? Number(member.membership_type.cbu_target) : 0
}

export const getCBUBalance = (member: Member): number => {
  const target = getCBUTarget(member)
  const current = Number(member.cbu) || 0
  return Math.max(0, target - current)
}

export const getBalance = (member: Member): number => {
  const totalPaid = getTotalPaid(member, 'membership')
  const requiredFee = getMembershipFee(member)
  return Math.max(0, requiredFee - totalPaid)
}

export const getPaymentStatus = (member: Member) => {
  const totalPaid = getTotalPaid(member, 'membership')
  const requiredFee = getMembershipFee(member)

  if (totalPaid >= requiredFee) {
    return { status: 'Full', color: 'success', percentage: 100 }
  } else {
    const percentage = requiredFee > 0 ? (totalPaid / requiredFee) * 100 : 0
    return {
      status: 'Partial',
      color: 'blue',
      percentage: Math.round(percentage)
    }
  }
}

export const getCBUStatus = (member: Member) => {
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

export const getPaymentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    membership: 'Membership Fee',
    monthly_dues: 'Monthly Dues',
    daily_dues: 'Daily Dues',
    cbu: 'CBU'
  }
  return labels[type] || type
}

export const paymentTypeOptions = [
  { title: 'Membership Fee', value: 'membership' },
  { title: 'Monthly Dues', value: 'monthly_dues' },
  { title: 'Daily Dues', value: 'daily_dues' },
  { title: 'CBU (Capital Build Up)', value: 'cbu' }
]