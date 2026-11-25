import React, { useState } from 'react';
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
  Shield,
  AlertCircle
} from 'lucide-react';

const MOTOR_COLOR = '#FF6B00';
const ACCIDENTAL_COLOR = '#FFD8BF';

export function AnalyticsCharts({ metrics = {} }) {
  // 'amount' | 'customers'
  const [chartView, setChartView] = useState('amount');

  const {
    insuranceTypeStats,
    paymentStatusCounts = { paid: 0, partial: 0, pending: 0 },
    totalBusiness = 0,
    totalCollected = 0,
    totalPending = 0,
    pendingPayments,
    customersWithPendingCount,
    partialPendingAmount
  } = metrics;

  const actualPending = totalPending || pendingPayments || 0;
  const actualCustomersWithPending = customersWithPendingCount ?? ((paymentStatusCounts?.partial || 0) + (paymentStatusCounts?.pending || 0));
  const actualPartialPending = partialPendingAmount || (paymentStatusCounts?.partial > 0 ? actualPending : 0);

  const motorTotal = insuranceTypeStats?.motor?.total || 0;
  const accidentalTotal = insuranceTypeStats?.accidental?.total || 0;
  const grandTotal = totalBusiness || (motorTotal + accidentalTotal);

  const motorPct = grandTotal > 0 ? ((motorTotal / grandTotal) * 100).toFixed(1) : '0.0';
  const accidentalPct = grandTotal > 0 ? ((accidentalTotal / grandTotal) * 100).toFixed(1) : '0.0';

  const typePieData = grandTotal > 0 ? [
    { name: 'Motor Insurance', value: motorTotal, color: MOTOR_COLOR },
    { name: 'Accidental Insurance', value: accidentalTotal, color: ACCIDENTAL_COLOR }
  ] : [
    { name: 'No Policies', value: 1, color: '#E2E8F0' }
  ];

  // Amount View Data (Collected vs Pending Amount)
  const amountData = [
    {
      name: 'Collected',
      value: totalCollected,
      fill: '#22C55E'
    },
    {
      name: 'Pending Due',
      value: actualPending,
      fill: '#FF6B00'
    }
  ];

  // Customer Count View Data
  const statusData = [
    { name: 'Paid', count: paymentStatusCounts?.paid || 0, fill: '#22C55E', sub: 'Fully Paid' },
    { name: 'Partial', count: paymentStatusCounts?.partial || 0, fill: '#FF6B00', sub: 'Pending Balance' },
    { name: 'Unpaid', count: paymentStatusCounts?.pending || 0, fill: '#F59E0B', sub: 'Full Unpaid' }
  ];

  const maxAmount = Math.max(totalCollected, actualPending, 10000);
  const maxCustomerCount = Math.max(
    paymentStatusCounts?.paid || 0,
    paymentStatusCounts?.partial || 0,
    paymentStatusCounts?.pending || 0,
    1
  );

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
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'var(--shadow-card)',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
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
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div className="card-title">
            <BarChart2 size={18} color="var(--primary-orange)" />
            <span>Payment Status Overview</span>
          </div>

          {/* View Toggle Pill */}
          <div className="chart-view-toggle">
            <button
              type="button"
              className={`chart-toggle-btn ${chartView === 'amount' ? 'active' : ''}`}
              onClick={() => setChartView('amount')}
              title="View collected vs pending amounts in ₹"
            >
              ₹ Amount
            </button>
            <button
              type="button"
              className={`chart-toggle-btn ${chartView === 'customers' ? 'active' : ''}`}
              onClick={() => setChartView('customers')}
              title="View customer count breakdown by payment status"
            >
              Customers
            </button>
          </div>
        </div>

        <div className="card-body chart-split-layout">
          {/* Bar Chart Area */}
          <div className="barchart-wrapper">
            {chartView === 'amount' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={amountData}
                  margin={{ top: 26, right: 10, left: -10, bottom: 5 }}
                  barSize={46}
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
                    domain={[0, Math.ceil(maxAmount * 1.25)]}
                    tickLine={false}
                    axisLine={{ stroke: '#F1E9E2' }}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickFormatter={(val) => {
                      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                      if (val >= 1000) return `₹${Math.round(val / 1000)}k`;
                      return `₹${val}`;
                    }}
                  />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Amount']}
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px',
                      border: '1px solid var(--card-border)',
                      boxShadow: 'var(--shadow-card)',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {amountData.map((entry, index) => (
                      <Cell key={`bar-amt-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(val) => formatCurrency(val)}
                      style={{ fill: '#1E293B', fontSize: '12px', fontWeight: 800 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
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
                    domain={[0, Math.max(4, maxCustomerCount + 1)]}
                    tickLine={false}
                    axisLine={{ stroke: '#F1E9E2' }}
                    tick={{ fontSize: 12, fill: '#94A3B8' }}
                  />
                  <Tooltip
                    formatter={(val, name, item) => [
                      `${val} Customer${val !== 1 ? 's' : ''}`,
                      item?.payload?.sub || name
                    ]}
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px',
                      border: '1px solid var(--card-border)',
                      boxShadow: 'var(--shadow-card)',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`bar-cust-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="top"
                      style={{ fill: '#1E293B', fontSize: '13px', fontWeight: 800 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status Badges List */}
          <div className="barchart-status-list">
            {chartView === 'amount' ? (
              <>
                {/* Collected */}
                <div className="barchart-status-pill status-paid" style={{ minWidth: '150px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#22C55E" />
                    <div>
                      <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>COLLECTED</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#15803D' }}>
                        {formatCurrency(totalCollected)}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#166534', backgroundColor: '#DCFCE7', padding: '2px 7px', borderRadius: '10px' }}>
                    {grandTotal > 0 ? Math.round((totalCollected / grandTotal) * 100) : 0}%
                  </span>
                </div>

                {/* Pending Due */}
                <div className="barchart-status-pill status-partial" style={{ minWidth: '150px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="var(--primary-orange)" />
                    <div>
                      <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 600 }}>PENDING DUE</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#EA580C' }}>
                        {formatCurrency(actualPending)}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#C2410C', backgroundColor: '#FFEDD5', padding: '2px 7px', borderRadius: '10px' }}>
                    {grandTotal > 0 ? Math.round((actualPending / grandTotal) * 100) : 0}%
                  </span>
                </div>

                {/* Alert note */}
                <div className="barchart-pending-alert-badge">
                  <AlertCircle size={14} color="#EA580C" />
                  <span>{actualCustomersWithPending} customer{actualCustomersWithPending !== 1 ? 's' : ''} with pending balance</span>
                </div>
              </>
            ) : (
              <>
                {/* Paid */}
                <div className="barchart-status-pill status-paid">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#22C55E" />
                    <div>
                      <span>Paid</span>
                      <div style={{ fontSize: '10px', color: '#166534', fontWeight: 600 }}>100% completed</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 800 }}>{paymentStatusCounts?.paid || 0}</span>
                </div>

                {/* Partial (Pending) */}
                <div className="barchart-status-pill status-partial">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="var(--primary-orange)" />
                    <div>
                      <span>Partial</span>
                      <div style={{ fontSize: '10px', color: '#EA580C', fontWeight: 700 }}>
                        {formatCurrency(actualPartialPending)} due
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 800 }}>{paymentStatusCounts?.partial || 0}</span>
                </div>

                {/* Unpaid (Pending) */}
                <div className="barchart-status-pill status-pending">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Hourglass size={16} color="#F59E0B" />
                    <div>
                      <span>Unpaid</span>
                      <div style={{ fontSize: '10px', color: '#B45309', fontWeight: 600 }}>0% paid</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 800 }}>{paymentStatusCounts?.pending || 0}</span>
                </div>

                {/* Total Pending Balance Summary */}
                <div className="barchart-pending-alert-badge">
                  <AlertCircle size={14} color="#EA580C" />
                  <span>Total Pending: {formatCurrency(actualPending)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
