import { useState, useMemo } from 'react';
import { FilterSidebar } from './FilterSidebar';
import { ChartCard } from './ChartCard';
import { Upload, RefreshCw, Filter, X, TrendingUp, Users, DollarSign, Package } from 'lucide-react';
import type { DatasetInfo } from '../App';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardProps {
  datasetInfo: DatasetInfo;
  onReset: () => void;
}

export interface FilterState {
  [columnName: string]: any[];
}

const COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#059669', '#0891B2', '#4F46E5'];

export function Dashboard({ datasetInfo, onReset }: DashboardProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [showFilters, setShowFilters] = useState(true);

  const filteredData = useMemo(() => {
    return datasetInfo.data.filter(row => {
      return Object.entries(filters).every(([col, values]) => {
        if (!values || values.length === 0) return true;
        return values.includes(row[col]);
      });
    });
  }, [datasetInfo.data, filters]);

  const categoricalColumns = datasetInfo.columns.filter(c => c.type === 'categorical');
  const numericalColumns = datasetInfo.columns.filter(c => c.type === 'numerical');
  const temporalColumns = datasetInfo.columns.filter(c => c.type === 'temporal');

  // Summary statistics
  const stats = useMemo(() => {
    const totalRecords = filteredData.length;
    const totalNumerical = numericalColumns.reduce((sum, col) => {
      return sum + filteredData.reduce((s, row) => s + (Number(row[col.name]) || 0), 0);
    }, 0);
    
    const avgNumerical = numericalColumns.length > 0 
      ? totalNumerical / (filteredData.length * numericalColumns.length)
      : 0;

    return {
      totalRecords,
      filteredRecords: filteredData.length,
      totalValue: totalNumerical,
      avgValue: avgNumerical,
      categories: categoricalColumns.length,
    };
  }, [filteredData, numericalColumns, categoricalColumns]);

  // Generate chart configurations
  const charts = useMemo(() => {
    const result: any[] = [];

    // 1. Categorical vs Numerical - Bar Charts
    if (categoricalColumns.length > 0 && numericalColumns.length > 0) {
      categoricalColumns.slice(0, 2).forEach(catCol => {
        numericalColumns.slice(0, 2).forEach(numCol => {
          const aggregated = filteredData.reduce((acc, row) => {
            const key = row[catCol.name];
            if (!acc[key]) acc[key] = { name: key, total: 0, count: 0 };
            acc[key].total += Number(row[numCol.name]) || 0;
            acc[key].count += 1;
            return acc;
          }, {} as Record<string, any>);

          const chartData = Object.values(aggregated).map((item: any) => ({
            name: item.name,
            value: item.total,
            average: item.total / item.count,
          }));

          result.push({
            title: `${numCol.name} by ${catCol.name}`,
            subtitle: `Total ${numCol.name.toLowerCase()} across different ${catCol.name.toLowerCase()} categories`,
            type: 'bar',
            data: chartData,
            dataKey: 'value',
            xKey: 'name',
          });
        });
      });
    }

    // 2. Temporal trends - Line Charts
    if (temporalColumns.length > 0 && numericalColumns.length > 0) {
      temporalColumns.forEach(timeCol => {
        numericalColumns.slice(0, 2).forEach(numCol => {
          const aggregated = filteredData.reduce((acc, row) => {
            const key = row[timeCol.name];
            if (!acc[key]) acc[key] = { name: key, total: 0 };
            acc[key].total += Number(row[numCol.name]) || 0;
            return acc;
          }, {} as Record<string, any>);

          const chartData = Object.entries(aggregated)
            .map(([key, value]: [string, any]) => ({
              name: key,
              value: value.total,
            }))
            .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

          result.push({
            title: `${numCol.name} Over Time`,
            subtitle: `Temporal trend showing ${numCol.name.toLowerCase()} progression`,
            type: 'line',
            data: chartData,
            dataKey: 'value',
            xKey: 'name',
          });
        });
      });
    }

    // 3. Categorical Distribution - Pie Charts
    if (categoricalColumns.length > 0) {
      categoricalColumns.slice(0, 2).forEach(catCol => {
        const distribution = filteredData.reduce((acc, row) => {
          const key = row[catCol.name];
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(distribution).map(([name, value]) => ({
          name,
          value,
        }));

        result.push({
          title: `${catCol.name} Distribution`,
          subtitle: `Breakdown of records by ${catCol.name.toLowerCase()}`,
          type: 'pie',
          data: chartData,
        });
      });
    }

    return result.slice(0, 6);
  }, [filteredData, categoricalColumns, numericalColumns, temporalColumns]);

  const renderChart = (chart: any, index: number) => {
    const isDark = document.documentElement.classList.contains('dark');
    
    const tooltipStyle = {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px',
    };

    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const axisColor = isDark ? '#94a3b8' : '#64748b';

    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} />
              <XAxis 
                dataKey={chart.xKey} 
                stroke={axisColor}
                tick={{ fill: axisColor }}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={axisColor}
                tick={{ fill: axisColor }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar 
                dataKey={chart.dataKey} 
                fill={COLORS[index % COLORS.length]} 
                radius={[4, 4, 0, 0]}
                name={chart.dataKey}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} />
              <XAxis 
                dataKey={chart.xKey} 
                stroke={axisColor}
                tick={{ fill: axisColor }}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={axisColor}
                tick={{ fill: axisColor }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey={chart.dataKey}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ fill: COLORS[index % COLORS.length], r: 4 }}
                activeDot={{ r: 6 }}
                name={chart.dataKey}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chart.data.map((_: any, idx: number) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v.length > 0).length;

  return (
    <div className="flex gap-6">
      {/* Filters Sidebar */}
      {showFilters && (
        <div className="w-80 flex-shrink-0">
          <FilterSidebar
            columns={datasetInfo.columns}
            data={datasetInfo.data}
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>
      )}

      {/* Main Dashboard */}
      <div className="flex-1 min-w-0">
        {/* Dashboard Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-1">
                Analytics Dashboard
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {filteredData.length} of {datasetInfo.data.length} records
                {activeFilterCount > 0 && ` • ${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                <span className="text-sm hidden sm:inline">
                  {showFilters ? 'Hide' : 'Show'} Filters
                </span>
              </button>
              <button
                onClick={() => setFilters({})}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Reset Filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">New Dataset</span>
              </button>
            </div>
          </div>

          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Records</p>
              <p className="text-slate-900 dark:text-white">{stats.totalRecords.toLocaleString()}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Filtered Records</p>
              <p className="text-slate-900 dark:text-white">{stats.filteredRecords.toLocaleString()}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Value</p>
              <p className="text-slate-900 dark:text-white">{stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Categories</p>
              <p className="text-slate-900 dark:text-white">{stats.categories}</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        {charts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.map((chart, index) => (
              <ChartCard key={index} title={chart.title} subtitle={chart.subtitle}>
                {renderChart(chart, index)}
              </ChartCard>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No visualizations available with current filters. Try adjusting your selection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
