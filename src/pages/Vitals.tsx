import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, parseISO } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Heart,
  Activity,
  Thermometer,
  Zap,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Filter,
  Download,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';


interface VitalRecord {
  id: string;
  user_id: string;
  heart_rate: number | null;
  blood_pressure: string | null;      
  temperature: number | null;
  oxygen_saturation?: number | null;  
  created_at: string;                    
  notes?: string | null;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  heart_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  temperature?: number;
  oxygen_saturation?: number;
}

type TimeRange = 'day' | 'week' | 'month';
type MetricType = 'heart_rate' | 'blood_pressure' | 'temperature' | 'oxygen_saturation';

const VitalsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('heart_rate');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metricConfig = {
    heart_rate: {
      label: 'Heart Rate',
      unit: 'bpm',
      color: '#ef4444',
      icon: Heart,
      normalRange: { min: 60, max: 100 },
      chartType: 'line' as const
    },
    blood_pressure: {
      label: 'Blood Pressure',
      unit: 'mmHg',
      color: '#f59e0b',
      icon: Activity,
      normalRange: { systolic: { min: 90, max: 140 }, diastolic: { min: 60, max: 90 } },
      chartType: 'area' as const
    },
    temperature: {
      label: 'Temperature',
      unit: '°F',
      color: '#06b6d4',
      icon: Thermometer,
      normalRange: { min: 97.0, max: 99.5 },
      chartType: 'line' as const
    },
    oxygen_saturation: {
      label: 'Oxygen Saturation',
      unit: '%',
      color: '#10b981',
      icon: Zap,
      normalRange: { min: 95, max: 100 },
      chartType: 'bar' as const
    }
  };

  const parseBloodPressure = (bp: string | null) => {
    if (!bp) return { systolic: undefined, diastolic: undefined };
    const parts = bp.split('/');
    if (parts.length !== 2) return { systolic: undefined, diastolic: undefined };
    const systolic = Number(parts[0]);
    const diastolic = Number(parts[1]);
    if (isNaN(systolic) || isNaN(diastolic)) return { systolic: undefined, diastolic: undefined };
    return { systolic, diastolic };
  };

  const fetchVitals = async () => {
  if (!user?.id) return;  // safer null check

  try {
    setLoading(true);

    const endDate = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = subDays(endDate, 1);
        break;
      case 'week':
        startDate = subDays(endDate, 7);
        break;
      case 'month':
        startDate = subMonths(endDate, 1);
        break;
      default:
        startDate = subDays(endDate, 7);
    }

    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const processedData = (data ?? []).map((record: VitalRecord) => {
      const { systolic, diastolic } = parseBloodPressure(record.blood_pressure);
      return {
        ...record,
        blood_pressure_systolic: systolic,
        blood_pressure_diastolic: diastolic,
      };
    });

    setVitals(processedData);
    processChartData(processedData);
  } catch (error: any) {
    console.error('Error fetching vitals:', error);
    toast.error('Failed to load vitals data');
  } finally {
    setLoading(false);
  }
};

const processChartData = (data: VitalRecord[]) => {
  const processedData: ChartDataPoint[] = data.map(record => ({
    date: record.created_at,
    displayDate: format(parseISO(record.created_at), timeRange === 'day' ? 'HH:mm' : 'MMM dd'),
    heart_rate: record.heart_rate ?? undefined,
    blood_pressure_systolic: record.blood_pressure_systolic ?? undefined,
    blood_pressure_diastolic: record.blood_pressure_diastolic ?? undefined,
    temperature: record.temperature ?? undefined,
    oxygen_saturation: record.oxygen_saturation ?? undefined,
  }));

  setChartData(processedData);
};

const handleRefresh = async () => {
  setIsRefreshing(true);
  await fetchVitals();
  setTimeout(() => setIsRefreshing(false), 500);
};

const getLatestValue = (metric: MetricType) => {
  const latest = vitals[vitals.length - 1];
  if (!latest) return null;

  switch (metric) {
    case 'heart_rate':
      return latest.heart_rate ?? null;
    case 'blood_pressure':
      return latest.blood_pressure_systolic && latest.blood_pressure_diastolic
        ? `${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`
        : null;
    case 'temperature':
      return latest.temperature ?? null;
    case 'oxygen_saturation':
      return latest.oxygen_saturation ?? null;
    default:
      return null;
  }
};

  const getTrend = (metric: MetricType) => {
    if (vitals.length < 2) return 'stable';
    
    const latest = vitals[vitals.length - 1];
    const previous = vitals[vitals.length - 2];
    
    let latestValue: number | null = null;
    let previousValue: number | null = null;
    
    switch (metric) {
  case 'heart_rate':
    latestValue = latest.heart_rate ?? null;
    previousValue = previous.heart_rate ?? null;
    break;
  case 'blood_pressure':
    latestValue = latest.blood_pressure_systolic ?? null;
    previousValue = previous.blood_pressure_systolic ?? null;
    break;
  case 'temperature':
    latestValue = latest.temperature ?? null;
    previousValue = previous.temperature ?? null;
    break;
  case 'oxygen_saturation':
    latestValue = latest.oxygen_saturation ?? null;
    previousValue = previous.oxygen_saturation ?? null;
    break;
}
    
    if (!latestValue || !previousValue) return 'stable';
    
    const difference = latestValue - previousValue;
    const threshold = latestValue * 0.05; // 5% threshold
    
    if (Math.abs(difference) < threshold) return 'stable';
    return difference > 0 ? 'up' : 'down';
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="vitals-page__empty-chart">
          <Activity className="empty-chart__icon" />
          <p className="empty-chart__text">No data available for the selected time range</p>
        </div>
      );
    }

    const config = metricConfig[selectedMetric];
    
    switch (config.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="displayDate" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={config.color}
                strokeWidth={3}
                dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="displayDate" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="blood_pressure_systolic"
                stackId="1"
                stroke="#f59e0b"
                fill="#fef3c7"
                name="Systolic"
              />
              <Area
                type="monotone"
                dataKey="blood_pressure_diastolic"
                stackId="2"
                stroke="#d97706"
                fill="#fed7aa"
                name="Diastolic"
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="displayDate" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar
                dataKey={selectedMetric}
                fill={config.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchVitals();
    }
  }, [user, timeRange]);

  if (loading) {
    return (
      <div className="vitals-page">
        <div className="vitals-page__container">
          <div className="vitals-page__loading">
            <div className="loading-spinner">
              <Activity className="loading-spinner__icon" />
            </div>
            <p className="loading-text">Loading vitals data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vitals-page">
      <div className="vitals-page__container">
        {/* Header */}
        <div className="vitals-page__header">
          <div className="header-content">
            <div className="header-info">
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn btn--ghost btn--icon header-back"
              >
                <ArrowLeft />
              </button>
              <div>
                <h1 className="header-title">Health Vitals</h1>
                <p className="header-subtitle">
                  Track and monitor your key health metrics over time
                </p>
              </div>
            </div>
            <div className="header-actions">
              <button
                onClick={handleRefresh}
                className={`btn btn--secondary ${isRefreshing ? 'btn--loading' : ''}`}
                disabled={isRefreshing}
              >
                <RefreshCw className={`btn__icon ${isRefreshing ? 'spinning' : ''}`} />
                Refresh
              </button>
              <button className="btn btn--outline">
                <Download className="btn__icon" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="vitals-page__metrics">
          {Object.entries(metricConfig).map(([key, config]) => {
            const metric = key as MetricType;
            const IconComponent = config.icon;
            const latestValue = getLatestValue(metric);
            const trend = getTrend(metric);
            
            return (
              <div
                key={key}
                className={`metric-card ${selectedMetric === metric ? 'metric-card--active' : ''}`}
                onClick={() => setSelectedMetric(metric)}
              >
                <div className="metric-card__icon" style={{ backgroundColor: `${config.color}15` }}>
                  <IconComponent style={{ color: config.color }} />
                </div>
                <div className="metric-card__content">
                  <h3 className="metric-card__label">{config.label}</h3>
                  <div className="metric-card__value">
                    {latestValue ? `${latestValue} ${config.unit}` : 'No data'}
                  </div>
                  <div className={`metric-card__trend metric-card__trend--${trend}`}>
                    {trend === 'up' && <TrendingUp className="trend-icon" />}
                    {trend === 'down' && <TrendingDown className="trend-icon" />}
                    {trend === 'stable' && <Minus className="trend-icon" />}
                    <span className="trend-text">
                      {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart Section */}
        <div className="vitals-page__chart-section">
          <div className="chart-header">
            <div className="chart-header__info">
              <h2 className="chart-title">
                {metricConfig[selectedMetric].label} Trends
              </h2>
              <p className="chart-subtitle">
                {timeRange === 'day' ? 'Last 24 hours' : 
                 timeRange === 'week' ? 'Last 7 days' : 'Last 30 days'}
              </p>
            </div>
            <div className="chart-header__controls">
              <div className="time-range-selector">
                {(['day', 'week', 'month'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`time-range-btn ${timeRange === range ? 'time-range-btn--active' : ''}`}
                  >
                    {range === 'day' ? '24H' : range === 'week' ? '7D' : '30D'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="chart-container">
            {renderChart()}
          </div>
        </div>

        {/* Recent Records */}
        <div className="vitals-page__recent">
          <div className="recent-header">
            <h3 className="recent-title">Recent Readings</h3>
            <button className="btn btn--ghost btn--small">
              <Filter className="btn__icon" />
              Filter
            </button>
          </div>
          
          <div className="recent-list">
            {vitals.slice(-5).reverse().map((vital) => (
              <div key={vital.id} className="recent-item">
                <div className="recent-item__date">
                  <Calendar className="date-icon" />
                  <span className="date-text">
                    {format(parseISO(vital.created_at), 'MMM dd, yyyy • h:mm a')}
                  </span>
                </div>
                <div className="recent-item__values">
                  {vital.heart_rate && (
                    <div className="value-item">
                      <Heart className="value-icon" style={{ color: metricConfig.heart_rate.color }} />
                      <span className="value-text">{vital.heart_rate} bpm</span>
                    </div>
                  )}
                  {vital.blood_pressure_systolic && vital.blood_pressure_diastolic && (
                    <div className="value-item">
                      <Activity className="value-icon" style={{ color: metricConfig.blood_pressure.color }} />
                      <span className="value-text">
                        {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic} mmHg
                      </span>
                    </div>
                  )}
                  {vital.temperature && (
                    <div className="value-item">
                      <Thermometer className="value-icon" style={{ color: metricConfig.temperature.color }} />
                      <span className="value-text">{vital.temperature}°F</span>
                    </div>
                  )}
                  {vital.oxygen_saturation && (
                    <div className="value-item">
                      <Zap className="value-icon" style={{ color: metricConfig.oxygen_saturation.color }} />
                      <span className="value-text">{vital.oxygen_saturation}%</span>
                    </div>
                  )}
                </div>
                {vital.notes && (
                  <div className="recent-item__notes">
                    <p className="notes-text">{vital.notes}</p>
                  </div>
                )}
              </div>
            ))}
            
            {vitals.length === 0 && (
              <div className="recent-empty">
                <Activity className="empty-icon" />
                <p className="empty-text">No vitals recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsPage;