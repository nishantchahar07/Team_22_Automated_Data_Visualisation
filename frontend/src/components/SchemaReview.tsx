import { useState } from 'react';
import { Check, ArrowRight, Database, Calendar, Hash, Tag, ArrowLeft } from 'lucide-react';
import type { ColumnSchema } from '../App';

interface SchemaReviewProps {
  columns: ColumnSchema[];
  fileName: string;
  onConfirm: (columns: ColumnSchema[]) => void;
  onBack: () => void;
}

export function SchemaReview({ columns, fileName, onConfirm, onBack }: SchemaReviewProps) {
  const [editedColumns, setEditedColumns] = useState<ColumnSchema[]>(columns);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'numerical':
        return <Hash className="w-4 h-4" />;
      case 'temporal':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'numerical':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'temporal':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    }
  };

  const handleTypeChange = (index: number, newType: 'categorical' | 'numerical' | 'temporal') => {
    const updated = [...editedColumns];
    updated[index] = { ...updated[index], type: newType };
    setEditedColumns(updated);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-slate-900 dark:text-white mb-2">
          Review Data Schema
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Verify auto-detected column types before generating your dashboard
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white">
                  {fileName}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {editedColumns.length} columns detected
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Column Name
                </th>
                <th className="px-6 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Detected Type
                </th>
                <th className="px-6 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Sample Values
                </th>
                <th className="px-6 py-3 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Adjust Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {editedColumns.map((column, index) => (
                <tr key={column.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-900 dark:text-white">
                        {column.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ${getTypeBadgeColor(column.type)}`}>
                      {getTypeIcon(column.type)}
                      <span className="capitalize">{column.type}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {column.sample.slice(0, 3).map((val, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          {String(val)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTypeChange(index, 'categorical')}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          column.type === 'categorical'
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        Categorical
                      </button>
                      <button
                        onClick={() => handleTypeChange(index, 'numerical')}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          column.type === 'numerical'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        Numerical
                      </button>
                      <button
                        onClick={() => handleTypeChange(index, 'temporal')}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          column.type === 'temporal'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        Temporal
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Upload</span>
          </button>
          
          <button
            onClick={() => onConfirm(editedColumns)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm">Generate Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm text-blue-900 dark:text-blue-200 mb-1">
          Understanding Column Types
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <span className="font-medium">Categorical:</span> Text values like regions or categories • 
          <span className="font-medium ml-2">Numerical:</span> Numbers for calculations • 
          <span className="font-medium ml-2">Temporal:</span> Dates and timestamps
        </p>
      </div>
    </div>
  );
}
