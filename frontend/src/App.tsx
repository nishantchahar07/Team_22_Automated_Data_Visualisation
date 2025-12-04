import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { ThemeToggle } from './components/ThemeToggle';
import { SchemaReview } from './components/SchemaReview';
import { BarChart3, Upload, LayoutDashboard, Settings, HelpCircle, User } from 'lucide-react';

export interface ColumnSchema {
  name: string;
  type: 'categorical' | 'numerical' | 'temporal';
  sample: any[];
}

export interface DatasetInfo {
  columns: ColumnSchema[];
  data: Record<string, any>[];
  fileName: string;
}

type Step = 'upload' | 'schema' | 'dashboard';

export default function App() {
  const [step, setStep] = useState<Step>('upload');
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | null>(null);
  const [isDark, setIsDark] = useState(false);

  const handleFileProcessed = (info: DatasetInfo) => {
    setDatasetInfo(info);
    setStep('schema');
  };

  const handleSchemaConfirmed = (updatedColumns: ColumnSchema[]) => {
    if (datasetInfo) {
      setDatasetInfo({ ...datasetInfo, columns: updatedColumns });
    }
    setStep('dashboard');
  };

  const handleReset = () => {
    setStep('upload');
    setDatasetInfo(null);
  };

  const navigationItems = [
    { icon: Upload, label: 'Upload', active: step === 'upload' },
    { icon: LayoutDashboard, label: 'Dashboard', active: step === 'dashboard' },
    { icon: Settings, label: 'Settings', active: false },
    { icon: HelpCircle, label: 'Help', active: false },
  ];

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-slate-900 dark:text-white">DataViz Pro</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Automated Analytics Platform
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-slate-900 dark:text-white">Admin User</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">admin@dataviz.com</p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full">
                    <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-[calc(100vh-73px)] hidden md:block">
            <nav className="p-4 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 p-6 md:p-8">
            {step === 'upload' && <FileUpload onFileProcessed={handleFileProcessed} />}
            {step === 'schema' && datasetInfo && (
              <SchemaReview
                columns={datasetInfo.columns}
                fileName={datasetInfo.fileName}
                onConfirm={handleSchemaConfirmed}
                onBack={handleReset}
              />
            )}
            {step === 'dashboard' && datasetInfo && (
              <Dashboard datasetInfo={datasetInfo} onReset={handleReset} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
