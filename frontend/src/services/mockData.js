/**
 * BMSIT Institutional Carbon Intelligence Dataset (2022 - 2026)
 * Autonomous fallback data provider for static / edge hosting environments (Vercel)
 * and offline evaluation sessions.
 */

const GRID_EMISSION_FACTOR = 0.82; // CEA India standard grid factor (kgCO2e / kWh)

export const BMSIT_INSTITUTE_NAME = "B.M.S. Institute of Technology and Management (BMSIT)";
export const BMSIT_CAMPUS_NAME = "BMSIT Yelahanka Campus, Bengaluru";

// 55 Months of Electricity Ingestion Data (2022 to mid 2026)
const MONTHS_MAP = [
  { num: 1, name: 'January' },
  { num: 2, name: 'February' },
  { num: 3, name: 'March' },
  { num: 4, name: 'April' },
  { num: 5, name: 'May' },
  { num: 6, name: 'June' },
  { num: 7, name: 'July' },
  { num: 8, name: 'August' },
  { num: 9, name: 'September' },
  { num: 10, name: 'October' },
  { num: 11, name: 'November' },
  { num: 12, name: 'December' },
];

function generateMonthlyHistory() {
  const history = [];
  const years = [2022, 2023, 2024, 2025, 2026];

  for (const year of years) {
    const maxMonth = year === 2026 ? 7 : 12; // 2026 data up to July
    for (let m = 1; m <= maxMonth; m++) {
      const monthObj = MONTHS_MAP[m - 1];
      const monthStr = String(m).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-01`;

      // Seasonal load pattern: Higher in Mar-May (summer cooling), lower in Dec-Jan
      const seasonalFactor = 1 + 0.28 * Math.sin(((m - 2) / 12) * 2 * Math.PI);
      const growthFactor = 1 + (year - 2022) * 0.035;

      const a_wing_kwh = Math.round(18500 * seasonalFactor * growthFactor);
      const b_wing_kwh = Math.round(8900 * seasonalFactor * growthFactor);
      const construction_kwh = year <= 2023 ? Math.round(1800 * (1 - (m / 24))) : 400;

      const total_kwh = a_wing_kwh + b_wing_kwh + construction_kwh;
      const total_co2e = Math.round(total_kwh * GRID_EMISSION_FACTOR * 10) / 10;
      const rate = 11.45 + (year - 2022) * 0.35;
      const total_amount = Math.round(total_kwh * rate);

      history.push({
        date: dateStr,
        year: year,
        month_number: m,
        month_name: monthObj.name,
        a_wing_kwh: a_wing_kwh,
        a_wing_co2e: Math.round(a_wing_kwh * GRID_EMISSION_FACTOR * 10) / 10,
        a_wing_amount: Math.round(a_wing_kwh * rate),
        a_wing_demand: year >= 2024 ? 312.5 : 295.0,
        a_wing_pf: 0.98,
        b_wing_kwh: b_wing_kwh,
        b_wing_co2e: Math.round(b_wing_kwh * GRID_EMISSION_FACTOR * 10) / 10,
        b_wing_amount: Math.round(b_wing_kwh * rate),
        b_wing_demand: year >= 2024 ? 148.0 : 138.5,
        b_wing_pf: 0.97,
        construction_kwh: construction_kwh,
        construction_amount: Math.round(construction_kwh * rate),
        total_kwh: total_kwh,
        total_co2e: total_co2e,
        total_amount: total_amount,
        avg_rate: rate,
      });
    }
  }
  return history;
}

export const bmsitMonthlyHistory = generateMonthlyHistory();

// Annual Trends from 2022 to 2026
export const bmsitAnnualTrends = [
  {
    year: 2022,
    recorded_months: 12,
    is_complete_year: true,
    total_kwh: 326400.0,
    total_co2e_kg: 267648.0,
    total_co2e_tons: 267.65,
    total_expense_inr: 3737280.0,
    avg_monthly_kwh: 27200.0,
    avg_monthly_co2e_kg: 22304.0,
    max_monthly_kwh: 34800.0,
    max_month: "April",
    min_monthly_kwh: 21900.0,
    min_month: "December",
    yoy_change_pct: null,
    yoy_summary_text: "Baseline Year (First institutional GHG accounting cycle)"
  },
  {
    year: 2023,
    recorded_months: 12,
    is_complete_year: true,
    total_kwh: 338500.0,
    total_co2e_kg: 277570.0,
    total_co2e_tons: 277.57,
    total_expense_inr: 3994300.0,
    avg_monthly_kwh: 28208.3,
    avg_monthly_co2e_kg: 23130.8,
    max_monthly_kwh: 36200.0,
    max_month: "May",
    min_monthly_kwh: 22800.0,
    min_month: "January",
    yoy_change_pct: 3.7,
    yoy_summary_text: "Electricity consumption increased by 3.7% compared with 2022 due to newly commissioned computational AI laboratories."
  },
  {
    year: 2024,
    recorded_months: 12,
    is_complete_year: true,
    total_kwh: 349100.0,
    total_co2e_kg: 286262.0,
    total_co2e_tons: 286.26,
    total_expense_inr: 4241565.0,
    avg_monthly_kwh: 29091.7,
    avg_monthly_co2e_kg: 23855.2,
    max_monthly_kwh: 37400.0,
    max_month: "April",
    min_monthly_kwh: 23400.0,
    min_month: "December",
    yoy_change_pct: 3.1,
    yoy_summary_text: "Electricity consumption increased by 3.1% compared with 2023."
  },
  {
    year: 2025,
    recorded_months: 12,
    is_complete_year: true,
    total_kwh: 335200.0,
    total_co2e_kg: 274864.0,
    total_co2e_tons: 274.86,
    total_expense_inr: 4223520.0,
    avg_monthly_kwh: 27933.3,
    avg_monthly_co2e_kg: 22905.3,
    max_monthly_kwh: 35100.0,
    max_month: "May",
    min_monthly_kwh: 21500.0,
    min_month: "December",
    yoy_change_pct: -4.0,
    yoy_summary_text: "Electricity consumption decreased by 4.0% compared with 2024 following rooftop solar array integration and LED retrofits."
  },
  {
    year: 2026,
    recorded_months: 7,
    is_complete_year: false,
    total_kwh: 198400.0,
    total_co2e_kg: 162688.0,
    total_co2e_tons: 162.69,
    total_expense_inr: 2549440.0,
    avg_monthly_kwh: 28342.9,
    avg_monthly_co2e_kg: 23241.1,
    max_monthly_kwh: 35900.0,
    max_month: "April",
    min_monthly_kwh: 22100.0,
    min_month: "January",
    yoy_change_pct: -1.8,
    yoy_summary_text: "Electricity consumption decreased by 1.8% compared with the same 7-month period in 2025."
  }
];

// Campus Appliance & Connected Load Inventory Breakdown
export const bmsitApplianceInventory = {
  institute: BMSIT_INSTITUTE_NAME,
  total_appliances_recorded: 2842,
  total_estimated_monthly_kwh: 28450.0,
  category_summary: {
    "Air Conditioning & HVAC": {
      category: "Air Conditioning & HVAC",
      total_quantity: 218,
      item_count: 5,
      known_power_count: 5,
      estimated_monthly_kwh: 13850.0,
      estimated_monthly_co2e_kg: 11357.0
    },
    "Computing Labs & Workstations": {
      category: "Computing Labs & Workstations",
      total_quantity: 940,
      item_count: 8,
      known_power_count: 8,
      estimated_monthly_kwh: 7920.0,
      estimated_monthly_co2e_kg: 6494.4
    },
    "High-Efficiency LED Lighting": {
      category: "High-Efficiency LED Lighting",
      total_quantity: 1250,
      item_count: 6,
      known_power_count: 6,
      estimated_monthly_kwh: 3410.0,
      estimated_monthly_co2e_kg: 2796.2
    },
    "Ventilation & Ceiling Fans": {
      category: "Ventilation & Ceiling Fans",
      total_quantity: 360,
      item_count: 3,
      known_power_count: 3,
      estimated_monthly_kwh: 2120.0,
      estimated_monthly_co2e_kg: 1738.4
    },
    "Laboratory & Workshop Machinery": {
      category: "Laboratory & Workshop Machinery",
      total_quantity: 74,
      item_count: 4,
      known_power_count: 4,
      estimated_monthly_kwh: 1150.0,
      estimated_monthly_co2e_kg: 943.0
    }
  },
  items: [
    { appliance_id: 1, appliance_name: "Ductable Split AC (5.0 Tr)", category: "Air Conditioning & HVAC", quantity: 24, rated_power_kw: 6.2, hours: 8 },
    { appliance_id: 2, appliance_name: "Inverter Split AC (2.0 Tr)", category: "Air Conditioning & HVAC", quantity: 68, rated_power_kw: 2.3, hours: 7 },
    { appliance_id: 3, appliance_name: "Cassette AC (3.0 Tr)", category: "Air Conditioning & HVAC", quantity: 42, rated_power_kw: 3.5, hours: 8 },
    { appliance_id: 4, appliance_name: "Dell OptiPlex Workstations", category: "Computing Labs & Workstations", quantity: 640, rated_power_kw: 0.18, hours: 6 },
    { appliance_id: 5, appliance_name: "AI GPU Servers (NVIDIA)", category: "Computing Labs & Workstations", quantity: 18, rated_power_kw: 1.2, hours: 24 },
    { appliance_id: 6, appliance_name: "T5 LED Batten Tube Lights (20W)", category: "High-Efficiency LED Lighting", quantity: 820, rated_power_kw: 0.02, hours: 9 },
    { appliance_id: 7, appliance_name: "BLDC Energy-Saving Ceiling Fans (28W)", category: "Ventilation & Ceiling Fans", quantity: 360, rated_power_kw: 0.028, hours: 8 },
    { appliance_id: 8, appliance_name: "Campus Water Filtration & Coolers", category: "Laboratory & Workshop Machinery", quantity: 28, rated_power_kw: 0.65, hours: 10 }
  ]
};

// Executive Dashboard Overview
export const bmsitDashboardOverview = {
  total_campus_emissions_kgco2e: 1428560.4,
  scope_breakdown: {
    scope_1: 182400.0,
    scope_2: 1171419.5,
    scope_3: 74740.9
  },
  top_departments: [
    { department_id: 1, department_name: "BMSIT Academic Block (A Wing - 350 KVA)", total_kgco2e: 789420.0 },
    { department_id: 2, department_name: "BMSIT Tech Hub (B Wing - 175 KVA)", total_kgco2e: 381999.5 },
    { department_id: 3, department_name: "Computer Science & Engineering", total_kgco2e: 98450.0 },
    { department_id: 4, department_name: "Mechanical Engineering Laboratories", total_kgco2e: 83950.9 },
    { department_id: 5, department_name: "Campus Central Data Center", total_kgco2e: 74740.0 }
  ]
};

// Machine Learning Forecasting Dataset
export const bmsitForecastData = {
  model_selection: {
    selected_model: "Random Forest Regressor (Ensemble Trees)",
    short_name: "Random Forest",
    rmse_kwh: 7537,
    mae_kwh: 6390,
    r2_score: 0.884,
    mape_pct: 7.9,
    rationale: "Selected over ARIMA due to superior capture of nonlinear summer peak cooling demand and institutional vacation scheduling.",
    validation_strategy: "Chronological Holdout Validation (12-Month Out-of-Sample Window)",
    benchmarks: [
      {
        model_name: "ARIMA(2, 0, 2) (AutoRegressive Integrated Moving Average)",
        short_name: "ARIMA",
        mae_kwh: 8940.0,
        rmse_kwh: 10620.0,
        r2_score: 0.742,
        mape_pct: 11.2,
        model_type: "Statistical Time-Series Model"
      },
      {
        model_name: "Random Forest Regressor (Ensemble Trees)",
        short_name: "Random Forest",
        mae_kwh: 6390.0,
        rmse_kwh: 7537.0,
        r2_score: 0.884,
        mape_pct: 7.9,
        model_type: "Non-linear Machine Learning Ensemble"
      }
    ]
  },
  forecast_summary: {
    total_predicted_co2e_kg: 146820,
    total_predicted_energy_kwh: 179050,
    peak_month: "April 2027",
  },
  forecast_breakdown: [
    { date: "2026-08-01", month: "Aug 2026", predicted_energy_kwh: 27400, predicted_co2e_kg: 22468, lower_bound_co2e_kg: 20220, upper_bound_co2e_kg: 24715, trend_direction: "UP" },
    { date: "2026-09-01", month: "Sep 2026", predicted_energy_kwh: 26800, predicted_co2e_kg: 21976, lower_bound_co2e_kg: 19780, upper_bound_co2e_kg: 24170, trend_direction: "DOWN" },
    { date: "2026-10-01", month: "Oct 2026", predicted_energy_kwh: 28100, predicted_co2e_kg: 23042, lower_bound_co2e_kg: 20740, upper_bound_co2e_kg: 25345, trend_direction: "UP" },
    { date: "2026-11-01", month: "Nov 2026", predicted_energy_kwh: 25400, predicted_co2e_kg: 20828, lower_bound_co2e_kg: 18745, upper_bound_co2e_kg: 22910, trend_direction: "DOWN" },
    { date: "2026-12-01", month: "Dec 2026", predicted_energy_kwh: 23200, predicted_co2e_kg: 19024, lower_bound_co2e_kg: 17120, upper_bound_co2e_kg: 20925, trend_direction: "DOWN" },
    { date: "2027-01-01", month: "Jan 2027", predicted_energy_kwh: 24500, predicted_co2e_kg: 20090, lower_bound_co2e_kg: 18080, upper_bound_co2e_kg: 22100, trend_direction: "UP" },
  ],
  chart_data: [
    { date: "2026-02-01", month: "Feb 2026", historical_co2e: 21450, historical_kwh: 26158, is_forecast: false },
    { date: "2026-03-01", month: "Mar 2026", historical_co2e: 26840, historical_kwh: 32731, is_forecast: false },
    { date: "2026-04-01", month: "Apr 2026", historical_co2e: 29438, historical_kwh: 35900, is_forecast: false },
    { date: "2026-05-01", month: "May 2026", historical_co2e: 28120, historical_kwh: 34292, is_forecast: false },
    { date: "2026-06-01", month: "Jun 2026", historical_co2e: 25980, historical_kwh: 31682, is_forecast: false },
    { date: "2026-07-01", month: "Jul 2026", historical_co2e: 24200, historical_kwh: 29512, is_forecast: false },
    { date: "2026-08-01", month: "Aug 2026", forecast_co2e: 22468, forecast_kwh: 27400, lower_bound_co2e: 20220, upper_bound_co2e: 24715, is_forecast: true },
    { date: "2026-09-01", month: "Sep 2026", forecast_co2e: 21976, forecast_kwh: 26800, lower_bound_co2e: 19780, upper_bound_co2e: 24170, is_forecast: true },
    { date: "2026-10-01", month: "Oct 2026", forecast_co2e: 23042, forecast_kwh: 28100, lower_bound_co2e: 20740, upper_bound_co2e: 25345, is_forecast: true },
    { date: "2026-11-01", month: "Nov 2026", forecast_co2e: 20828, forecast_kwh: 25400, lower_bound_co2e: 18745, upper_bound_co2e: 22910, is_forecast: true },
    { date: "2026-12-01", month: "Dec 2026", forecast_co2e: 19024, forecast_kwh: 23200, lower_bound_co2e: 17120, upper_bound_co2e: 20925, is_forecast: true },
    { date: "2027-01-01", month: "Jan 2027", forecast_co2e: 20090, forecast_kwh: 24500, lower_bound_co2e: 18080, upper_bound_co2e: 22100, is_forecast: true },
  ]
};

// Campus Departments List
export const bmsitDepartments = [
  { id: 1, name: "BMSIT Academic Block (A Wing)", code: "A-WING", description: "Central lecture halls, deanery, and auditorium (350 KVA demand)" },
  { id: 2, name: "BMSIT Tech Hub (B Wing)", code: "B-WING", description: "Engineering laboratories, faculty chambers, and server rooms (175 KVA demand)" },
  { id: 3, name: "Computer Science & Engineering", code: "CSE", description: "Computing labs, data analytics lab, and IoT research center" },
  { id: 4, name: "Information Science & Engineering", code: "ISE", description: "Software development labs and network infrastructure" },
  { id: 5, name: "Electronics & Communication Engineering", code: "ECE", description: "VLSI, embedded systems, and communication labs" },
  { id: 6, name: "Mechanical Engineering", code: "MECH", description: "Thermal engineering labs and manufacturing workshops" }
];

// Emission Factors Registry
export const bmsitEmissionFactors = [
  { id: 1, category: "Scope 2", subcategory: "Grid Electricity", activity_unit: "kWh", factor_value: 0.82, factor_unit: "kgCO2e/kWh", source: "Central Electricity Authority (CEA)", region: "India", is_active: true },
  { id: 2, category: "Scope 1", subcategory: "Diesel Generators (Backup)", activity_unit: "Liter", factor_value: 2.68, factor_unit: "kgCO2e/L", source: "GHG Protocol stationary combustion", region: "Global", is_active: true },
  { id: 3, category: "Scope 1", subcategory: "Campus Fleet Vehicles (Petrol)", activity_unit: "Liter", factor_value: 2.31, factor_unit: "kgCO2e/L", source: "IPCC Guidelines for GHG Inventories", region: "Global", is_active: true },
  { id: 4, category: "Scope 3", subcategory: "Municipal Tap Water Supply", activity_unit: "kL", factor_value: 0.34, factor_unit: "kgCO2e/kL", source: "BWSSB / Water Life Cycle Assessment", region: "India", is_active: true },
  { id: 5, category: "Scope 3", subcategory: "Solid Municipal Waste Disposal", activity_unit: "kg", factor_value: 1.25, factor_unit: "kgCO2e/kg", source: "EPA WARM Lifecycle model", region: "India", is_active: true }
];
