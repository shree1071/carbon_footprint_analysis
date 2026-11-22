import React, { useState } from 'react';
import {
  calculateFromQuestionnaire,
  calculateFromCSV,
  SAMPLE_CSV_TEMPLATE,
  EMISSION_FACTORS,
} from '../../utils/carbonCalculator';
import { formatNumber, formatCarbon } from '../../utils/formatters';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Calculator,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Download,
  Building2,
  Users,
  Zap,
  Flame,
  Bus,
  Droplets,
  Trash2,
  Sun,
  ShieldCheck,
  TrendingDown,
  Layers,
  Sparkles,
  ArrowRight,
  Printer,
} from 'lucide-react';

const BMSIT_DEFAULT_PRESET = {
  campusName: 'B.M.S. Institute of Technology & Management (BMSIT)',
  academicYear: '2025–2026',
  campusPopulation: 4800,
  gridElectricityKwh: 349100,
  solarGenerationKwh: 42000,
  dieselGeneratorLiters: 2400,
  fleetPetrolLiters: 1850,
  fleetDieselLiters: 3200,
  lpgCookingKg: 4200,
  dailyCommutersCount: 3100,
  avgCommuteDistanceKm: 14,
  annualWorkingDays: 220,
  waterConsumptionKl: 5400,
  solidWasteKg: 22500,
  recycledWasteKg: 4500,
};

export const CampusCalculatorPage = () => {
  const [activeTab, setActiveTab] = useState('questionnaire'); // 'questionnaire' | 'csv'
  const [formData, setFormData] = useState({ ...BMSIT_DEFAULT_PRESET });
  const [csvFile, setCsvFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loadPreset = () => {
    setFormData({ ...BMSIT_DEFAULT_PRESET });
    setErrorMsg('');
  };

  const clearForm = () => {
    setFormData({
      campusName: '',
      academicYear: '2025–2026',
      campusPopulation: '',
      gridElectricityKwh: '',
      solarGenerationKwh: '',
      dieselGeneratorLiters: '',
      fleetPetrolLiters: '',
      fleetDieselLiters: '',
      lpgCookingKg: '',
      dailyCommutersCount: '',
      avgCommuteDistanceKm: '',
      annualWorkingDays: 220,
      waterConsumptionKl: '',
      solidWasteKg: '',
      recycledWasteKg: '',
    });
    setResults(null);
    setErrorMsg('');
  };

  const handleQuestionnaireSubmit = (e) => {
    e.preventDefault();
    setIsCalculating(true);
    setErrorMsg('');
    try {
      const computed = calculateFromQuestionnaire(formData);
      setResults(computed);
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setErrorMsg(err.message || 'Error executing carbon calculation.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please select a valid .csv file format.');
      return;
    }

    setCsvFile(file);
    setCsvFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleCsvSubmit = (e) => {
    e.preventDefault();
    if (!csvText) {
      setErrorMsg('Please upload a CSV file before calculating.');
      return;
    }

    setIsCalculating(true);
    setErrorMsg('');
    try {
      const computed = calculateFromCSV(csvText, formData.campusName || 'BMSIT Campus');
      setResults(computed);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to parse CSV records. Please check column format.');
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadSampleTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bmsit_campus_carbon_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAuditCSV = () => {
    if (!results) return;

    const rows = [
      ['Metric', 'Value', 'Unit', 'Scope'],
      ['Campus Institution', results.campusName, '', 'Metadata'],
      ['Reporting Period', results.academicYear, '', 'Metadata'],
      ['Campus Population', results.population, 'Persons', 'Metadata'],
      ['Total Gross Carbon Footprint', results.totalTons, 'Metric Tonnes CO2e', 'Summary'],
      ['Per Capita Carbon Footprint', results.perCapitaKg, 'kgCO2e / Person', 'Summary'],
      ['Scope 1 Direct Emissions', (results.scope1Kg / 1000).toFixed(2), 'Metric Tonnes CO2e', 'Scope 1'],
      ['Scope 2 Electricity Emissions', (results.scope2Kg / 1000).toFixed(2), 'Metric Tonnes CO2e', 'Scope 2'],
      ['Scope 3 Value Chain Emissions', (results.scope3Kg / 1000).toFixed(2), 'Metric Tonnes CO2e', 'Scope 3'],
      ['Solar Renewable Offset', (results.solarOffsetKg / 1000).toFixed(2), 'Metric Tonnes CO2e Avoided', 'Offset'],
      [],
      ['Category Breakdown', 'Emissions (kgCO2e)', 'Share (%)', 'Scope'],
      ...results.categoryBreakdown.map((c) => [c.name, c.kg.toFixed(1), c.percentage.toFixed(1) + '%', c.scope]),
    ];

    const csvContent = rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${results.campusName.replace(/[^a-zA-Z0-9]/g, '_')}_Audit_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Platform Header */}
      <div className="card-surface p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-transparent to-sky-500/10 border-emerald-300 dark:border-emerald-500/30">
        <div className="relative z-10">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-[11px] font-bold font-mono uppercase tracking-wider">
              ISO 14064-1 & GHG Protocol Standards
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
              CEA 0.82 Grid Factor
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Campus Carbon Footprint Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
            Institutional greenhouse gas accounting platform for colleges and university campuses. Input your campus operational metrics via questionnaire or upload utility CSV records to instantly compute Scope 1, Scope 2, and Scope 3 emissions.
          </p>
        </div>
      </div>

      {/* Input Method Toggle Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('questionnaire')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'questionnaire'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Campus Questionnaire Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'csv'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload Utility CSV
          </button>
        </div>

        {activeTab === 'questionnaire' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadPreset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load BMSIT Sample Data
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-600 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 text-xs font-semibold hover:bg-sky-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Sample CSV Template
          </button>
        )}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* ===================== VIEW A: QUESTIONNAIRE FORM ===================== */}
      {activeTab === 'questionnaire' && (
        <form onSubmit={handleQuestionnaireSubmit} className="space-y-6">
          {/* SECTION 1: Campus Identity */}
          <div className="card-surface p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  1. Campus Profile & Population
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  General institutional details for per-capita intensity indexing
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  name="campusName"
                  value={formData.campusName}
                  onChange={handleChange}
                  placeholder="e.g. B.M.S. Institute of Technology"
                  className="w-full px-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reporting Period / Academic Year
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  placeholder="e.g. 2025–2026"
                  className="w-full px-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campus Population (Students + Faculty + Staff)
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="campusPopulation"
                    value={formData.campusPopulation}
                    onChange={handleChange}
                    placeholder="4800"
                    min="1"
                    className="w-full pl-9 pr-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Scope 2 - Electricity & Power */}
          <div className="card-surface p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  2. Scope 2: Purchased Electricity & Renewables
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Grid electricity invoices and on-campus rooftop solar generations (Factor: 0.82 kgCO2e/kWh)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Grid Electricity Consumed (kWh / year)
                </label>
                <input
                  type="number"
                  name="gridElectricityKwh"
                  value={formData.gridElectricityKwh}
                  onChange={handleChange}
                  placeholder="e.g. 349100"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Sum of utility bills across all campus blocks/wings</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rooftop Solar PV Clean Generation (kWh / year)
                </label>
                <input
                  type="number"
                  name="solarGenerationKwh"
                  value={formData.solarGenerationKwh}
                  onChange={handleChange}
                  placeholder="e.g. 42000"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">Subtracted as direct clean renewable offset</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Scope 1 - Direct Fuels */}
          <div className="card-surface p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Flame className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  3. Scope 1: Direct On-Campus Combustion
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Backup diesel generators, campus-owned transport fleets, and canteen/chemistry lab fuels
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Diesel Generator Fuel (Liters / year)
                </label>
                <input
                  type="number"
                  name="dieselGeneratorLiters"
                  value={formData.dieselGeneratorLiters}
                  onChange={handleChange}
                  placeholder="e.g. 2400"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Factor: 2.68 kgCO2e / L</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campus Fleet Petrol (Liters / year)
                </label>
                <input
                  type="number"
                  name="fleetPetrolLiters"
                  value={formData.fleetPetrolLiters}
                  onChange={handleChange}
                  placeholder="e.g. 1850"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Factor: 2.31 kgCO2e / L</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Canteen & Lab LPG (kg / year)
                </label>
                <input
                  type="number"
                  name="lpgCookingKg"
                  value={formData.lpgCookingKg}
                  onChange={handleChange}
                  placeholder="e.g. 4200"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Factor: 1.51 kgCO2e / kg</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Scope 3 - Value Chain */}
          <div className="card-surface p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Bus className="w-5 h-5 text-sky-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  4. Scope 3: Commuting, Water & Solid Waste
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Indirect supply chain, daily transit passenger-kilometers, municipal pumping, and waste disposal
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Commuters (Students & Staff)
                </label>
                <input
                  type="number"
                  name="dailyCommutersCount"
                  value={formData.dailyCommutersCount}
                  onChange={handleChange}
                  placeholder="e.g. 3100"
                  min="0"
                  className="w-full px-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Avg One-Way Commute (km)
                </label>
                <input
                  type="number"
                  name="avgCommuteDistanceKm"
                  value={formData.avgCommuteDistanceKm}
                  onChange={handleChange}
                  placeholder="e.g. 14"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Annual round-trip distance computed (220 working days)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Municipal Water (kL)
                </label>
                <div className="relative">
                  <Droplets className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="waterConsumptionKl"
                    value={formData.waterConsumptionKl}
                    onChange={handleChange}
                    placeholder="e.g. 5400"
                    min="0"
                    step="any"
                    className="w-full pl-9 pr-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Factor: 0.34 kgCO2e / kL</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Solid Waste Generated (kg / year)
                </label>
                <div className="relative">
                  <Trash2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="solidWasteKg"
                    value={formData.solidWasteKg}
                    onChange={handleChange}
                    placeholder="e.g. 22500"
                    min="0"
                    step="any"
                    className="w-full pl-9 pr-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Factor: 1.25 kgCO2e / kg</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recycled / Composted Waste (kg)
                </label>
                <input
                  type="number"
                  name="recycledWasteKg"
                  value={formData.recycledWasteKg}
                  onChange={handleChange}
                  placeholder="e.g. 4500"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 rounded-xl input-surface text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Subtracted from landfill diversion</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isCalculating}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-50"
            >
              {isCalculating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Executing Calculation Engine...
                </span>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Calculate Campus Carbon Footprint
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ===================== VIEW B: CSV UPLOAD ===================== */}
      {activeTab === 'csv' && (
        <form onSubmit={handleCsvSubmit} className="space-y-6">
          <div className="card-surface p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:border-emerald-500 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Upload Utility & Activity CSV Dataset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Select or drop your spreadsheet containing monthly electricity consumption (kWh), fuel liters, water kL, and waste kilograms.
            </p>

            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm">
              <UploadCloud className="w-4 h-4" />
              <span>Select CSV File</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            {csvFileName && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Selected: {csvFileName}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!csvText || isCalculating}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-50"
            >
              {isCalculating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Parsing & Calculating...
                </span>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Parse & Calculate Carbon Footprint
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ===================== RESULTS SECTION ===================== */}
      {results && (
        <div id="results-section" className="space-y-6 pt-6 border-t-2 border-emerald-500/30">
          {/* Results Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono block">
                Calculated Carbon Audit Results
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {results.campusName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reporting Period: {results.academicYear} • Indexed against {formatNumber(results.population)} campus members
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={exportAuditCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export Audit CSV
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Summary
              </button>
            </div>
          </div>

          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Gross Carbon */}
            <div className="card-surface p-5 border-emerald-300 dark:border-emerald-600/40 relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">
                Total Campus Footprint
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-mono">
                  {formatNumber(results.totalTons)}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  t CO₂e
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                {formatNumber(results.totalKg)} kg CO₂e gross
              </span>
            </div>

            {/* Per Capita Intensity */}
            <div className="card-surface p-5 border-sky-300 dark:border-sky-600/40 relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">
                Per-Capita Intensity
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-mono">
                  {formatNumber(results.perCapitaKg)}
                </span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                  kg / person
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                {(results.perCapitaKg / 1000).toFixed(2)} tonnes / capita / yr
              </span>
            </div>

            {/* Scope 2 Electricity Share */}
            <div className="card-surface p-5 border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">
                Scope 2 (Electricity)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                  {(results.scope2Kg / 1000).toFixed(1)}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  t CO₂e
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                {results.totalKg > 0 ? ((results.scope2Kg / results.totalKg) * 100).toFixed(1) : 0}% of campus emissions
              </span>
            </div>

            {/* Solar Clean Offset */}
            <div className="card-surface p-5 border-amber-300 dark:border-amber-600/40 relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">
                Clean Solar Offsets
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-amber-500 tracking-tight font-mono">
                  {(results.solarOffsetKg / 1000).toFixed(1)}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  t CO₂e avoided
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
                Direct on-campus rooftop PV
              </span>
            </div>
          </div>

          {/* Visual Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scope Distribution Donut */}
            <div className="card-surface p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Multi-Scope Breakdown (ISO 14064)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={results.scopeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {results.scopeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${formatNumber(val)} kg CO₂e (${((val / results.totalKg) * 100).toFixed(1)}%)`, 'Emissions']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-center font-mono">
                <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">Scope 1</div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    {(results.scope1Kg / 1000).toFixed(1)} t
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Scope 2</div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    {(results.scope2Kg / 1000).toFixed(1)} t
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50">
                  <div className="text-[10px] text-sky-700 dark:text-sky-400 font-bold">Scope 3</div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    {(results.scope3Kg / 1000).toFixed(1)} t
                  </div>
                </div>
              </div>
            </div>

            {/* Category Ranking Bar Chart */}
            <div className="card-surface p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Category Emission Contributions
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={results.categoryBreakdown.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`} />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [`${formatNumber(v)} kg CO₂e`, 'Emissions']} />
                    <Bar dataKey="kg" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
                <span>Top driver: <strong className="text-slate-900 dark:text-slate-100">{results.categoryBreakdown[0]?.name}</strong></span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {results.categoryBreakdown[0]?.percentage.toFixed(1)}% of total
                </span>
              </div>
            </div>
          </div>

          {/* Category Breakdown Data Table */}
          <div className="card-surface p-5 sm:p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              Comprehensive Category Activity Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="py-2.5 px-3">Emission Source</th>
                    <th className="py-2.5 px-3">Protocol Scope</th>
                    <th className="py-2.5 px-3 text-right">Emissions (kg CO₂e)</th>
                    <th className="py-2.5 px-3 text-right">Metric Tonnes</th>
                    <th className="py-2.5 px-3 text-right">Relative Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {results.categoryBreakdown.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold font-sans text-slate-800 dark:text-slate-200">
                        {row.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.scope === 'Scope 1' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                          row.scope === 'Scope 2' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                          'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
                        }`}>
                          {row.scope}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                        {formatNumber(row.kg)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        {(row.kg / 1000).toFixed(2)} t
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {row.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
