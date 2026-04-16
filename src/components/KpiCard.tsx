import type { ReactNode } from 'react'

interface KpiCardProps {
  icon: ReactNode
  label: string
  value: string
  sub: string
  tone: 'green' | 'red' | 'amber' | 'neutral'
}

export function KpiCard({ icon, label, value, sub, tone }: KpiCardProps) {
  return (
    <div className={`kpi-card kpi-${tone}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-body">
        <span className="kpi-label">{label}</span>
        <strong className="kpi-value">{value}</strong>
        <span className="kpi-sub" dangerouslySetInnerHTML={{ __html: sub }} />
      </div>
    </div>
  )
}
