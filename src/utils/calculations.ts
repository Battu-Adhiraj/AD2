export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme';
export type Phenotype = 'standard' | 'indian';

export interface UserMetrics {
  age: number;
  gender: Gender;
  weight: number; // kg
  height: number; // cm
  waist: number; // cm
  neck: number; // cm
  hip: number; // cm (optional for male, but we'll keep it in type)
  activityLevel: ActivityLevel;
  phenotype: Phenotype;
}

export interface HealthResults {
  bmi: number;
  whtr: number;
  bodyFatPercentage: number;
  fatMass: number;
  leanBodyMass: number;
  ffmi: number;
  bmr: number;
  tdee: number;
  proteinTarget: number;
  mis: number; // Metabolic Integrity Score
  misColor: string;
  riskFlags: string[];
}

// Helper: Log10
const log10 = (x: number) => Math.log10(x);

export const calculateHealthMetrics = (metrics: UserMetrics): HealthResults => {
  const { age, gender, weight, height, waist, neck, hip, activityLevel, phenotype } = metrics;

  // Input Validation
  if (age <= 0 || weight <= 0 || height <= 0 || waist <= 0 || neck <= 0) {
    throw new Error("Invalid input metrics. All core values must be greater than 0.");
  }
  if (gender === 'female' && hip <= 0) {
    throw new Error("Hip measurement is required for females.");
  }
  if (gender === 'male' && waist <= neck) {
    throw new Error("Waist measurement must be greater than neck measurement.");
  }
  if (gender === 'female' && (waist + hip) <= neck) {
    throw new Error("Waist + Hip measurement must be greater than neck measurement.");
  }

  // 1. Core Anthropometrics
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  const whtr = waist / height;

  // 2. Body Composition (US Navy Method)
  let bodyFatPercentage = 0;
  if (gender === 'male') {
    // Male: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    // Ensure waist > neck to avoid log errors
    const waistNeckDiff = Math.max(1, (waist - neck) / 2.54);
    bodyFatPercentage = 495 / (1.0324 - 0.19077 * log10(waistNeckDiff) + 0.15456 * log10(height / 2.54)) - 450;
  } else {
    // Female: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
    const waistHipNeckDiff = Math.max(1, (waist + hip - neck) / 2.54);
    bodyFatPercentage = 495 / (1.29579 - 0.35004 * log10(waistHipNeckDiff) + 0.22100 * log10(height / 2.54)) - 450;
  }
  
  // Clamp BF% to reasonable limits (e.g. 2% to 70%)
  bodyFatPercentage = Math.max(2, Math.min(70, bodyFatPercentage));

  const fatMass = weight * (bodyFatPercentage / 100);
  const leanBodyMass = weight - fatMass;
  
  // Normalized FFMI
  // FFMI = (LBM / (m^2)) + 6.1 * (1.8 - m)
  const ffmi = (leanBodyMass / (heightM * heightM)) + 6.1 * (1.8 - heightM);

  // 3. Metabolic & Nutritional
  // BMR (Mifflin-St Jeor)
  // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr += gender === 'male' ? 5 : -161;

  // Activity Multiplier
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9,
  };
  const tdee = bmr * multipliers[activityLevel];

  // LBM-Based Protein
  const proteinMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.6,
    moderate: 2.0,
    active: 2.4,
    extreme: 2.7,
  };
  const proteinTarget = leanBodyMass * proteinMultipliers[activityLevel];

  // 4. Metabolic Integrity Score (MIS) Engine
  // Base score 1-10 weighted: BF% (40%), FFMI (40%), WHtR (20%)
  
  // Scoring Helper (Linear interpolation: value, best, worst) -> 0 to 1 score
  const getScore = (val: number, best: number, worst: number) => {
    if (best < worst) {
      if (val <= best) return 1;
      if (val >= worst) return 0;
      return 1 - (val - best) / (worst - best);
    } else {
      if (val >= best) return 1;
      if (val <= worst) return 0;
      return (val - worst) / (best - worst);
    }
  };

  // Define optimal ranges (simplified clinical targets for scoring)
  // These are approximations for the sake of the algorithm
  let bfScore = 0;
  let ffmiScore = 0;
  let whtrScore = 0;

  if (gender === 'male') {
    bfScore = getScore(bodyFatPercentage, 10, 30); // 10% is great, 30% is poor
    ffmiScore = getScore(ffmi, 22, 16); // 22 is muscular, 16 is low
    whtrScore = getScore(whtr, 0.45, 0.60); // 0.45 is excellent, 0.60 is high risk
  } else {
    bfScore = getScore(bodyFatPercentage, 18, 38); // 18% great, 38% poor
    ffmiScore = getScore(ffmi, 18, 13); // 18 muscular, 13 low
    whtrScore = getScore(whtr, 0.45, 0.60);
  }

  let rawMis = (bfScore * 4) + (ffmiScore * 4) + (whtrScore * 2); 
  // Map 0-10 scale (sum of weights is 4+4+2 = 10)
  
  // Visceral Gatekeeper Veto
  const whtrLimit = phenotype === 'indian' ? 0.48 : 0.50;
  const visceralFlag = whtr > whtrLimit;
  
  if (visceralFlag) {
    rawMis = Math.min(rawMis, 3.0);
  }

  // Age Handicap
  if (age >= 60) {
    rawMis += 1.0;
  } else if (age >= 40) {
    rawMis += 0.5;
  }
  
  const mis = Math.min(10, Math.max(1, rawMis));

  // Color
  let misColor = '#ef4444'; // Red
  if (mis >= 7) misColor = '#10b981'; // Green
  else if (mis >= 4) misColor = '#eab308'; // Yellow

  // 5. Metabolomic Index (Risk Diagnostics)
  const riskFlags: string[] = [];
  
  if (visceralFlag) {
    riskFlags.push("Warning: Visceral Limit Exceeded");
  }

  // High Risk (Insulin Resistance)
  // Define "High" BF% as > 25 (Male) or > 32 (Female) approx
  const highBf = gender === 'male' ? 25 : 32;
  if (whtr > whtrLimit && bodyFatPercentage > highBf) {
    riskFlags.push("High Risk: Insulin Resistance Profile");
  }

  // Elevated Risk (Cardiovascular)
  if (bmi > 25 && whtr > whtrLimit) {
    riskFlags.push("Elevated Risk: Cardiovascular Strain");
  }

  // Sarcopenic Profile ("Thin-Fat")
  // BMI < 24.9, BF% > High, FFMI < Average (Male 19, Female 15)
  const avgFfmi = gender === 'male' ? 19 : 15;
  if (bmi < 24.9 && bodyFatPercentage > highBf && ffmi < avgFfmi) {
    riskFlags.push("Sarcopenic Profile Detected (Thin-Fat)");
  }

  return {
    bmi,
    whtr,
    bodyFatPercentage,
    fatMass,
    leanBodyMass,
    ffmi,
    bmr,
    tdee,
    proteinTarget,
    mis,
    misColor,
    riskFlags
  };
};
