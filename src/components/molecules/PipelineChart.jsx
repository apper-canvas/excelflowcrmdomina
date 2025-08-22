import React, { useMemo } from "react";
import Chart from "react-apexcharts";

const PipelineChart = ({ data, conversionRates, loading = false }) => {
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      },
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return '$' + (val / 1000).toFixed(0) + 'K';
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#374151']
      }
    },
    xaxis: {
      categories: data?.map(item => item.stage) || [],
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return '$' + (val / 1000).toFixed(0) + 'K';
        },
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      }
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 3
    },
    colors: ['#4F46E5'],
    tooltip: {
      y: {
        formatter: function (val, { dataPointIndex }) {
          const item = data[dataPointIndex];
          return `$${val.toLocaleString()} (${item.count} deals)`;
        }
      }
    }
  }), [data]);

  const chartSeries = useMemo(() => [
    {
      name: 'Pipeline Value',
      data: data?.map(item => item.value) || []
    }
  ], [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <p className="text-sm">No pipeline data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="bar"
        height={350}
      />

      {/* Conversion Rates */}
      {conversionRates && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {conversionRates.Lead_to_Qualified || 0}%
            </div>
            <div className="text-xs text-gray-500">Lead → Qualified</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {conversionRates.Qualified_to_Proposal || 0}%
            </div>
            <div className="text-xs text-gray-500">Qualified → Proposal</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {conversionRates.Proposal_to_Closed_Won || 0}%
            </div>
            <div className="text-xs text-gray-500">Proposal → Won</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-primary-600">
              {conversionRates.overall || 0}%
            </div>
            <div className="text-xs text-gray-500">Overall Conversion</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineChart;