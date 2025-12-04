const Dataset = require('../models/dataset');
const DatasetField = require('../models/datasetField');
const Dashboard = require('../models/dashboard');
const Chart = require('../models/chart');
const Filter = require('../models/filter');
const ChartFilter = require('../models/chartFilter');

async function autoVisualize(datasetId) {
  const fields = await DatasetField.find({ dataset_id: datasetId }).lean();
  const temporal = fields.find(f => f.inferred_type === 'temporal');
  const numerical = fields.find(f => f.inferred_type === 'numerical');
  const categorical = fields.find(f => f.inferred_type === 'categorical');

  const dataset = await Dataset.findById(datasetId).lean();
  const dashboard = await Dashboard.create({
    dataset_id: datasetId,
    title: `${dataset?.name || 'Dataset'} Dashboard`,
    description: 'Auto-generated dashboard',
    layout: { version: 1, widgets: [] },
  });

  const charts = [];
  if (categorical && numerical) {
    charts.push(await Chart.create({
      dashboard_id: dashboard._id,
      title: `${numerical.display_name || numerical.field_name} by ${categorical.display_name || categorical.field_name}`,
      chart_type: 'bar',
      x_field_id: categorical._id,
      y_field_id: numerical._id,
      aggregation: 'sum',
      options: { color: '#3b82f6' },
    }));
  }
  if (temporal && numerical) {
    charts.push(await Chart.create({
      dashboard_id: dashboard._id,
      title: `${numerical.display_name || numerical.field_name} over time`,
      chart_type: 'line',
      x_field_id: temporal._id,
      y_field_id: numerical._id,
      aggregation: 'sum',
      options: { color: '#10b981' },
    }));
  }
  if (categorical && numerical) {
    charts.push(await Chart.create({
      dashboard_id: dashboard._id,
      title: `Share of ${numerical.display_name || numerical.field_name} by ${categorical.display_name || categorical.field_name}`,
      chart_type: 'pie',
      x_field_id: categorical._id,
      y_field_id: numerical._id,
      aggregation: 'sum',
      options: {},
    }));
  }

  if (categorical) {
    const filter = await Filter.create({
      dashboard_id: dashboard._id,
      field_id: categorical._id,
      filter_type: 'value',
      config: { multi: true },
      default_value: [],
    });
    await Promise.all(charts.map(c => ChartFilter.create({ chart_id: c._id, filter_id: filter._id, mode: 'include' })));
  }

  return { dashboardId: dashboard._id, chartCount: charts.length };
}

module.exports = { autoVisualize };
