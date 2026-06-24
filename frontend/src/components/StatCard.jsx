import '../styles/StatCard.css';

export default function StatCard({ title, value, icon, color }) {
  return (
    <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="left">
        <div className="title">{title}</div>
        <div className="value">{value}</div>
      </div>
      <div className="iconBox" style={{ background: color + '20' }}>
        <span style={{ fontSize: '28px' }}>{icon}</span>
      </div>
    </div>
  );
}