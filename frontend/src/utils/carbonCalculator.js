/**
 * Deterministic Campus Carbon Calculator Engine
 * Conforms to ISO 14064-1 & Greenhouse Gas (GHG) Protocol Corporate Standard
 * Emission factors based on Central Electricity Authority (CEA) India and IPCC Guidelines.
 */

export const EMISSION_FACTORS = {
  // Scope 2
  GRID_ELECTRICITY_KWH: 0.82,       // kgCO2e / kWh (CEA India Western/Southern grid baseline)
  SOLAR_OFFSET_KWH: 0.82,           // kgCO2e / kWh avoided

  // Scope 1
  DIESEL_GENERATOR_LITER: 2.68,     // kgCO2e / L (IPCC stationary combustion)
  FLEET_PETROL_LITER: 2.31,         // kgCO2e / L (IPCC transport combustion)
  FLEET_DIESEL_LITER: 2.68,         // kgCO2e / L
  LPG_KG: 1.51,                     // kgCO2e / kg (canteen / chemistry labs)

  // Scope 3
  COMMUTER_PASSENGER_KM: 0.14,      // kgCO2e / passenger-km (mixed 2-wheeler / bus / car)
  MUNICIPAL_WATER_KL: 0.34,         // kgCO2e / kL (water pumping, treatment & supply)
  SOLID_WASTE_KG: 1.25,             // kgCO2e / kg (mixed municipal solid waste to landfill)
  RECYCLED_WASTE_OFFSET_KG: 0.85,   // kgCO2e / kg avoided via recycling & composting
};

/**
 * Calculate carbon footprint from structured campus questionnaire
 */
export function calculateFromQuestionnaire(inputs) {
  const population = Math.max(1, Number(inputs.campusPopulation) || 4500);

  // Scope 1: Direct Combustion
  const dieselLiters = Math.max(0, Number(inputs.dieselGeneratorLiters) || 0);
  const fleetPetrolLiters = Math.max(0, Number(inputs.fleetPetrolLiters) || 0);
  const fleetDieselLiters = Math.max(0, Number(inputs.fleetDieselLiters) || 0);
  const lpgKg = Math.max(0, Number(inputs.lpgCookingKg) || 0);

  const gensetCo2e = dieselLiters * EMISSION_FACTORS.DIESEL_GENERATOR_LITER;
  const fleetPetrolCo2e = fleetPetrolLiters * EMISSION_FACTORS.FLEET_PETROL_LITER;
  const fleetDieselCo2e = fleetDieselLiters * EMISSION_FACTORS.FLEET_DIESEL_LITER;
  const lpgCo2e = lpgKg * EMISSION_FACTORS.LPG_KG;
  const scope1Total = gensetCo2e + fleetPetrolCo2e + fleetDieselCo2e + lpgCo2e;

  // Scope 2: Purchased Electricity
  const electricityKwh = Math.max(0, Number(inputs.gridElectricityKwh) || 0);
  const solarGenKwh = Math.max(0, Number(inputs.solarGenerationKwh) || 0);

  const grossElectricityCo2e = electricityKwh * EMISSION_FACTORS.GRID_ELECTRICITY_KWH;
  const solarOffsetCo2e = solarGenKwh * EMISSION_FACTORS.SOLAR_OFFSET_KWH;
  const scope2Total = Math.max(0, grossElectricityCo2e - solarOffsetCo2e);

  // Scope 3: Campus Value Chain
  const dailyCommuters = Math.max(0, Number(inputs.dailyCommutersCount) || 0);
  const avgCommuteKm = Math.max(0, Number(inputs.avgCommuteDistanceKm) || 0);
  const annualWorkingDays = Math.max(1, Number(inputs.annualWorkingDays) || 220);

  // Two trips per day (round trip)
  const annualPassengerKm = dailyCommuters * avgCommuteKm * 2 * annualWorkingDays;
  const commuteCo2e = annualPassengerKm * EMISSION_FACTORS.COMMUTER_PASSENGER_KM;

  const waterKl = Math.max(0, Number(inputs.waterConsumptionKl) || 0);
  const waterCo2e = waterKl * EMISSION_FACTORS.MUNICIPAL_WATER_KL;

  const wasteKg = Math.max(0, Number(inputs.solidWasteKg) || 0);
  const recycledKg = Math.max(0, Number(inputs.recycledWasteKg) || 0);
  const netWasteKg = Math.max(0, wasteKg - recycledKg);
  const wasteCo2e = netWasteKg * EMISSION_FACTORS.SOLID_WASTE_KG;

  const scope3Total = commuteCo2e + waterCo2e + wasteCo2e;

  // Grand Total
  const grandTotalKg = scope1Total + scope2Total + scope3Total;
  const grandTotalTons = grandTotalKg / 1000.0;
  const perCapitaKg = grandTotalKg / population;

  // Category breakdown
  const categoryBreakdown = [
    { name: 'Grid Electricity', scope: 'Scope 2', kg: grossElectricityCo2e, percentage: grandTotalKg > 0 ? (grossElectricityCo2e / grandTotalKg) * 100 : 0 },
    { name: 'Student & Faculty Commute', scope: 'Scope 3', kg: commuteCo2e, percentage: grandTotalKg > 0 ? (commuteCo2e / grandTotalKg) * 100 : 0 },
    { name: 'Diesel Generators', scope: 'Scope 1', kg: gensetCo2e, percentage: grandTotalKg > 0 ? (gensetCo2e / grandTotalKg) * 100 : 0 },
    { name: 'Campus Fleet Vehicles', scope: 'Scope 1', kg: fleetPetrolCo2e + fleetDieselCo2e, percentage: grandTotalKg > 0 ? ((fleetPetrolCo2e + fleetDieselCo2e) / grandTotalKg) * 100 : 0 },
    { name: 'Municipal Solid Waste', scope: 'Scope 3', kg: wasteCo2e, percentage: grandTotalKg > 0 ? (wasteCo2e / grandTotalKg) * 100 : 0 },
    { name: 'Canteen & Labs LPG', scope: 'Scope 1', kg: lpgCo2e, percentage: grandTotalKg > 0 ? (lpgCo2e / grandTotalKg) * 100 : 0 },
    { name: 'Campus Water Supply', scope: 'Scope 3', kg: waterCo2e, percentage: grandTotalKg > 0 ? (waterCo2e / grandTotalKg) * 100 : 0 },
  ].sort((a, b) => b.kg - a.kg);

  // Scope chart data
  const scopeChartData = [
    { name: 'Scope 1 (Direct Fuels)', value: Math.round(scope1Total), color: '#f59e0b', sharePct: grandTotalKg > 0 ? ((scope1Total / grandTotalKg) * 100).toFixed(1) : 0 },
    { name: 'Scope 2 (Electricity)', value: Math.round(scope2Total), color: '#10b981', sharePct: grandTotalKg > 0 ? ((scope2Total / grandTotalKg) * 100).toFixed(1) : 0 },
    { name: 'Scope 3 (Value Chain)', value: Math.round(scope3Total), color: '#0ea5e9', sharePct: grandTotalKg > 0 ? ((scope3Total / grandTotalKg) * 100).toFixed(1) : 0 },
  ];

  return {
    campusName: inputs.campusName || 'B.M.S. Institute of Technology & Management (BMSIT)',
    academicYear: inputs.academicYear || '2025–2026',
    population,
    totalKg: Math.round(grandTotalKg),
    totalTons: Number(grandTotalTons.toFixed(2)),
    perCapitaKg: Math.round(perCapitaKg),
    scope1Kg: Math.round(scope1Total),
    scope2Kg: Math.round(scope2Total),
    scope3Kg: Math.round(scope3Total),
    solarOffsetKg: Math.round(solarOffsetCo2e),
    scopeChartData,
    categoryBreakdown,
    rawInputs: inputs,
    computedAt: new Date().toISOString(),
  };
}

/**
 * Parse CSV text and compute carbon calculations
 */
export function calculateFromCSV(csvText, campusName = 'BMSIT Campus') {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row.');
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));

  let totalElectricityKwh = 0;
  let totalDieselL = 0;
  let totalPetrolL = 0;
  let totalLpgKg = 0;
  let totalWaterKl = 0;
  let totalWasteKg = 0;
  let totalCommuters = 0;
  let totalSolarKwh = 0;
  let rowCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((v) => v.trim());
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;

    rowCount++;
    headers.forEach((header, colIdx) => {
      const val = parseFloat(row[colIdx]) || 0;
      if (header.includes('elec') || header.includes('kwh') || header.includes('unit')) {
        totalElectricityKwh += val;
      } else if (header.includes('diesel') || header.includes('genset')) {
        totalDieselL += val;
      } else if (header.includes('petrol') || header.includes('fleet')) {
        totalPetrolL += val;
      } else if (header.includes('lpg') || header.includes('gas')) {
        totalLpgKg += val;
      } else if (header.includes('water') || header.includes('kl')) {
        totalWaterKl += val;
      } else if (header.includes('waste') || header.includes('garbage')) {
        totalWasteKg += val;
      } else if (header.includes('commut') || header.includes('student') || header.includes('staff')) {
        totalCommuters = Math.max(totalCommuters, val);
      } else if (header.includes('solar') || header.includes('pv')) {
        totalSolarKwh += val;
      }
    });
  }

  return calculateFromQuestionnaire({
    campusName,
    academicYear: `Annual Dataset (${rowCount} Recorded Entries)`,
    campusPopulation: totalCommuters > 0 ? totalCommuters : 4500,
    gridElectricityKwh: totalElectricityKwh,
    solarGenerationKwh: totalSolarKwh,
    dieselGeneratorLiters: totalDieselL,
    fleetPetrolLiters: totalPetrolL,
    fleetDieselLiters: 0,
    lpgCookingKg: totalLpgKg,
    dailyCommutersCount: totalCommuters > 0 ? totalCommuters : 2800,
    avgCommuteDistanceKm: 12,
    annualWorkingDays: 220,
    waterConsumptionKl: totalWaterKl,
    solidWasteKg: totalWasteKg,
    recycledWasteKg: Math.round(totalWasteKg * 0.15),
  });
}

/**
 * Standard CSV Template for download
 */
export const SAMPLE_CSV_TEMPLATE = `Month,Electricity_kWh,Solar_kWh,Diesel_Genset_L,Fleet_Petrol_L,LPG_kg,Water_kL,Waste_kg,Daily_Commuters
January,27500,2800,180,120,340,420,1850,3200
February,28400,3100,160,115,320,410,1780,3200
March,33200,3800,210,130,350,460,1920,3200
April,35900,4200,290,140,360,510,2050,3200
May,34500,4000,240,110,310,480,1890,3200
June,28900,2600,150,125,330,430,1760,3200
July,27200,2400,140,130,340,420,1740,3200
August,27800,2500,160,120,350,430,1790,3200
September,28300,2900,170,125,340,440,1810,3200
October,29100,3200,190,135,360,450,1860,3200
November,26400,3000,150,115,330,410,1720,3200
December,24800,2900,130,110,320,390,1680,3200`;
