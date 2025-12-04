import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { DatasetInfo, ColumnSchema } from '../App';

interface FileUploadProps {
  onFileProcessed: (info: DatasetInfo) => void;
}

export function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inferColumnType = (values: any[]): 'categorical' | 'numerical' | 'temporal' => {
    const nonNullValues = values.filter(v => v != null && v !== '');
    
    if (nonNullValues.length === 0) return 'categorical';

    let dateCount = 0;
    let numberCount = 0;
    
    for (const val of nonNullValues.slice(0, 100)) {
      const date = new Date(val);
      if (!isNaN(date.getTime()) && typeof val === 'string' && val.match(/\d{4}|\d{1,2}\/\d{1,2}/)) {
        dateCount++;
      }
      if (typeof val === 'number' || (!isNaN(Number(val)) && typeof val !== 'boolean')) {
        numberCount++;
      }
    }

    if (dateCount / nonNullValues.length > 0.5) return 'temporal';
    if (numberCount / nonNullValues.length > 0.7) return 'numerical';
    
    return 'categorical';
  };

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      if (jsonData.length === 0) {
        throw new Error('The file appears to be empty');
      }

      const firstRow = jsonData[0] as Record<string, any>;
      const columnNames = Object.keys(firstRow);

      const columns: ColumnSchema[] = columnNames.map(name => {
        const values = jsonData.map(row => (row as Record<string, any>)[name]);
        const type = inferColumnType(values);
        const sample = values.filter(v => v != null).slice(0, 5);

        return { name, type, sample };
      });

      onFileProcessed({
        columns,
        data: jsonData as Record<string, any>[],
        fileName: file.name
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileProcessed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.csv') || file.name.endsWith('.xls'))) {
      processFile(file);
    } else {
      setError('Please upload a valid Excel (.xlsx, .xls) or CSV file');
    }
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-slate-900 dark:text-white mb-2">
          Upload Your Data
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Import Excel or CSV files to generate automated insights and visualizations
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed transition-all ${
          isDragging 
            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' 
            : 'border-slate-300 dark:border-slate-600'
        } p-12`}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center text-center">
          {isProcessing ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-2">
                Processing your data...
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Analyzing columns and inferring data types
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-slate-900 dark:text-white mb-2">
                Drag and drop your file here
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                or click to browse from your computer
              </p>
              
              <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-500">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel (.xlsx, .xls)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>CSV</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-900 dark:text-red-200">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-slate-900 dark:text-white mb-2">
              Try Sample Dataset
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Don't have data ready? Load our sample sales dataset to explore DataViz Pro's capabilities.
            </p>
            <button
              onClick={() => {
                const sampleData = [
                  { Date: '2024-01-01', Region: 'North', Product: 'Laptop', Sales: 45000, Quantity: 15, Category: 'Electronics' },
                  { Date: '2024-01-01', Region: 'South', Product: 'Phone', Sales: 32000, Quantity: 40, Category: 'Electronics' },
                  { Date: '2024-02-01', Region: 'North', Product: 'Tablet', Sales: 28000, Quantity: 25, Category: 'Electronics' },
                  { Date: '2024-02-01', Region: 'East', Product: 'Laptop', Sales: 52000, Quantity: 18, Category: 'Electronics' },
                  { Date: '2024-03-01', Region: 'West', Product: 'Phone', Sales: 38000, Quantity: 45, Category: 'Electronics' },
                  { Date: '2024-03-01', Region: 'South', Product: 'Monitor', Sales: 22000, Quantity: 30, Category: 'Electronics' },
                  { Date: '2024-04-01', Region: 'North', Product: 'Keyboard', Sales: 8000, Quantity: 100, Category: 'Accessories' },
                  { Date: '2024-04-01', Region: 'East', Product: 'Mouse', Sales: 6000, Quantity: 120, Category: 'Accessories' },
                  { Date: '2024-05-01', Region: 'West', Product: 'Laptop', Sales: 48000, Quantity: 16, Category: 'Electronics' },
                  { Date: '2024-05-01', Region: 'South', Product: 'Tablet', Sales: 31000, Quantity: 28, Category: 'Electronics' },
                  { Date: '2024-06-01', Region: 'North', Product: 'Phone', Sales: 41000, Quantity: 50, Category: 'Electronics' },
                  { Date: '2024-06-01', Region: 'East', Product: 'Monitor', Sales: 25000, Quantity: 35, Category: 'Electronics' },
                ];

                const columns: ColumnSchema[] = [
                  { name: 'Date', type: 'temporal', sample: ['2024-01-01', '2024-02-01'] },
                  { name: 'Region', type: 'categorical', sample: ['North', 'South', 'East'] },
                  { name: 'Product', type: 'categorical', sample: ['Laptop', 'Phone', 'Tablet'] },
                  { name: 'Sales', type: 'numerical', sample: [45000, 32000, 28000] },
                  { name: 'Quantity', type: 'numerical', sample: [15, 40, 25] },
                  { name: 'Category', type: 'categorical', sample: ['Electronics', 'Accessories'] },
                ];

                onFileProcessed({
                  columns,
                  data: sampleData,
                  fileName: 'sample-sales-data.xlsx'
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Load Sample Data
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="text-slate-900 dark:text-white mb-2">Smart Parsing</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Automatically detects column types and data patterns
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
            <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="text-slate-900 dark:text-white mb-2">Multiple Formats</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Support for Excel and CSV files of any size
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="text-slate-900 dark:text-white mb-2">Instant Analysis</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Get insights and visualizations within seconds
          </p>
        </div>
      </div>
    </div>
  );
}
