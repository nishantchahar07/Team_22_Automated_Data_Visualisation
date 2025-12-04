import { useMemo } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { ColumnSchema } from '../App';
import type { FilterState } from './Dashboard';

interface FilterSidebarProps {
  columns: ColumnSchema[];
  data: Record<string, any>[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function FilterSidebar({ columns, data, filters, onFilterChange }: FilterSidebarProps) {
  const filterableColumns = columns.filter(c => c.type === 'categorical' || c.type === 'temporal');

  const uniqueValues = useMemo(() => {
    const result: Record<string, any[]> = {};
    filterableColumns.forEach(col => {
      const values = [...new Set(data.map(row => row[col.name]).filter(v => v != null))];
      result[col.name] = values.sort();
    });
    return result;
  }, [filterableColumns, data]);

  const handleToggleValue = (columnName: string, value: any) => {
    const currentValues = filters[columnName] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange({
      ...filters,
      [columnName]: newValues.length === 0 ? [] : newValues,
    });
  };

  const handleClearColumn = (columnName: string) => {
    const newFilters = { ...filters };
    delete newFilters[columnName];
    onFilterChange(newFilters);
  };

  const totalActiveFilters = Object.values(filters).filter(v => v && v.length > 0).length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden h-fit sticky top-24">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-slate-900 dark:text-white">
              Filters
            </h3>
          </div>
          {totalActiveFilters > 0 && (
            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
              {totalActiveFilters}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
        {filterableColumns.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No filterable columns available
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filterableColumns.map(column => {
              const values = uniqueValues[column.name] || [];
              const selectedValues = filters[column.name] || [];
              const hasSelection = selectedValues.length > 0;

              return (
                <div key={column.name} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm text-slate-700 dark:text-slate-300">
                      {column.name}
                    </h4>
                    {hasSelection && (
                      <button
                        onClick={() => handleClearColumn(column.name)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 max-h-48 overflow-y-auto">
                    {values.map((value, index) => {
                      const isSelected = selectedValues.includes(value);
                      return (
                        <label
                          key={index}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleValue(column.name, value)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                            {String(value)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalActiveFilters > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={() => onFilterChange({})}
            className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
