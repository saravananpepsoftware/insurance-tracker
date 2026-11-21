import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  PieChart as PieIcon,
  BarChart2,
  Car,
  UserCheck,
  CheckCircle2,
  Clock,
  Hourglass,
  Shield
} from 'lucide-react';

const MOTOR_COLOR = '#FF6B00';
const ACCIDENTAL_COLOR = '#FFD8BF';

export function AnalyticsCharts({ metrics }) {
  const { insuranceTypeStats, paymentStatusCounts } = metrics;

  const motorTotal = insuranceTypeStats?.motor?.total || 271500;
  const accidentalTotal = insuranceTypeStats?.accidental?.total || 96500;
  const grandTotal = motorTotal + accidentalTotal || 368000;

  const motorPct = grandTotal > 0 ? ((motorTotal / grandTotal) * 100).toFixed(1) : '73.8';
  const accidentalPct = grandTotal > 0 ? ((accidentalTotal / grandTotal) * 100).toFixed(1) : '26.2';

  const typePieData = [
    { name: 'Motor Insurance', value: motorTotal, color: MOTOR_COLOR },
    { name: 'Accidental Insurance', value: accidentalTotal, color: ACCIDENTAL_COLOR }
  ];

  const statusData = [
    { name: 'Paid', count: paymentStatusCounts?.paid || 3, fill: '#22C55E' },
    { name: 'Partial', count: paymentStatusCounts?.partial || 5, fill: '#FF6B00' },
    { name: 'Pending', count: paymentStatusCounts?.pending || 2, fill: '#F59E0B' }
  ];

  return (
    <div className="charts-grid">
      {/* Chart 1: Insurance Type Distribution */}
      <div className="app-card chart-card">
        <div className="card-header">
          <div className="card-title">
            <PieIcon size={18} color="var(--primary-orange)" />
            <span>Insurance Type Distribution</span>
          </div>
          <span className="chart-header-subtext">Policies & Value</span>
        </div>

        <div className="card-body chart-split-layout">
          {/* Donut Chart with Center Content */}
          <div className="donut-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typePieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={98}
                  startAngle={90}
                  endAngle={-270}
                  stroke="#FFFFFF"
                  strokeWidth={3}
                >
                  {typePieData.map((entry, index) => (
                    <Cell key={`donut-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Value']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #F1E9E2',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Exact Center Overlay */}
            <div className="donut-center-overlay">
              <div className="donut-shield-badge">
                <Shield size={15} strokeWidth={2.5} />
              </div>
              <div className="donut-center-amount">
                {formatCurrency(grandTotal)}
              </div>
              <div className="donut-center-label">
                Total Business
              </div>
            </div>
          </div>

          {/* Legend Items */}
          <div className="donut-legend-container">
            {/* Motor Total */}
            <div className="donut-legend-item">
              <div className="donut-legend-left">
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: MOTOR_COLOR, flexShrink: 0 }} />
                <div className="donut-legend-icon-box" style={{ backgroundColor: '#FFEFE5', color: MOTOR_COLOR }}>
                  <Car size={16} />
                </div>
                <div>
                  <div className="donut-legend-title">Motor Total</div>
                  <div className="donut-legend-value">{formatCurrency(motorTotal)}</div>
                </div>
              </div>
              <div
                className="donut-legend-pill"
                style={{ backgroundColor: '#FFEFE5', color: MOTOR_COLOR }}
              >
                {motorPct}%
              </div>
            </div>

            {/* Accidental Total */}
            <div className="donut-legend-item">
              <div className="donut-legend-left">
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: ACCIDENTAL_COLOR, flexShrink: 0 }} />
                <div className="donut-legend-icon-box" style={{ backgroundColor: '#FFF5EE', color: '#D97706' }}>
                  <UserCheck size={16} />
                </div>
                <div>
                  <div className="donut-legend-title">Accidental Total</div>
                  <div className="donut-legend-value">{formatCurrency(accidentalTotal)}</div>
                </div>
              </div>
              <div
                className="donut-legend-pill"
                style={{ backgroundColor: '#FFEADB', color: '#EA580C' }}
              >
                {accidentalPct}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart 2: Payment Status Overview */}
      <div className="app-card chart-card">
        <div className="card-header">
          <div className="card-title">
            <BarChart2 size={18} color="var(--primary-orange)" />
            <span>Payment Status Overview</span>
          </div>
          <span className="chart-header-subtext">Customer Breakdown</span>
        </div>

        <div className="card-body chart-split-layout">
          {/* Bar Chart */}
          <div className="barchart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{ top: 24, right: 10, left: -24, bottom: 5 }}
                barSize={38}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1E9E2" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: '#F1E9E2' }}
                  tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, 6]}
                  ticks={[0, 1, 2, 3, 4, 5, 6]}
                  tickLine={false}
                  axisLine={{ stroke: '#F1E9E2' }}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    style={{ fill: '#1E293B', fontSize: '13px', fontWeight: 800 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Badges List */}
          <div className="barchart-status-list">
            <div className="barchart-status-pill status-paid">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#22C55E" />
                <span>Paid</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 800 }}>{paymentStatusCounts?.paid || 3}</span>
            </div>

            <div className="barchart-status-pill status-partial">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--primary-orange)" />
                <span>Partial</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 800 }}>{paymentStatusCounts?.partial || 5}</span>
            </div>

            <div className="barchart-status-pill status-pending">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hourglass size={16} color="#F59E0B" />
                <span>Pending</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 800 }}>{paymentStatusCounts?.pending || 2}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
