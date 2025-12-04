const express = require('express');
const multer = require('multer');
const path = require('path');
const { parseBuffer } = require('../services/parseFile');
const { inferTypes } = require('../services/inferTypes');
const Dataset = require('../models/dataset');
const DatasetField = require('../models/datasetField');
const DatasetRecord = require('../models/datasetRecord');
const Upload = require('../models/upload');
const { autoVisualize } = require('../services/autoVisualize');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded. Use form field name "file".' });

    const { originalname, mimetype, buffer, size } = req.file;
    const nameNoExt = path.parse(originalname).name;

    const uploadDoc = await Upload.create({
      original_name: originalname,
      content_type: mimetype,
      size_bytes: size,
      storage_path: `memory://${originalname}`,
      status: 'received',
    });

    const { headers, rows } = parseBuffer(buffer, mimetype, originalname);

    const dataset = await Dataset.create({
      upload_id: uploadDoc._id,
      name: nameNoExt,
      description: 'Auto-ingested dataset',
      row_count: rows.length,
      column_count: headers.length,
      inferred_at: new Date(),
    });

    const inferred = inferTypes(headers, rows);

    const fieldDocs = await DatasetField.insertMany(inferred.map((f) => ({
      dataset_id: dataset._id,
      ordinal_position: f.ordinal_position,
      field_name: f.field_name,
      display_name: f.display_name,
      inferred_type: f.inferred_type,
      is_nullable: f.is_nullable,
      distinct_count: f.distinct_count,
      sample_rate: 1,
      min_value: f.min_value,
      max_value: f.max_value,
      top_values: f.top_values,
    })));

    if (rows.length > 0) {
      const docs = rows.map((row) => ({ dataset_id: dataset._id, row_data: row }));
      await DatasetRecord.insertMany(docs, { ordered: false });
    }

    await Upload.updateOne({ _id: uploadDoc._id }, { $set: { status: 'parsed' } });

    const { dashboardId, chartCount } = await autoVisualize(dataset._id);

    res.status(201).json({
      message: 'Upload and ingestion complete',
      datasetId: dataset._id,
      dashboardId,
      fields: fieldDocs.length,
      rows: rows.length,
      charts: chartCount,
    });
  } catch (err) {
    if (req.file) {
      await Upload.create({
        original_name: req.file.originalname,
        content_type: req.file.mimetype,
        size_bytes: req.file.size,
        storage_path: `memory://${req.file.originalname}`,
        status: 'error',
        error_message: err.message,
      }).catch(()=>{});
    }
    next(err);
  }
});

module.exports = router;
