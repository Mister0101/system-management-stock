interface PanelHeaderProps {
  title: string
  subtitle: string
}

export function PanelHeader({ title, subtitle }: PanelHeaderProps) {
  return (
    <div className="panel-header">
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  )
}
