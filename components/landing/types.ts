export interface ScenarioItem {
  id: string;
  category: 'buren' | 'werk' | 'zakelijk' | 'familie' | 'huur';
  categoryLabel: string;
  title: string;
  partyA: {
    name: string;
    role: string;
    avatar: string;
    initialStatement: string;
    hiddenNeed: string;
  };
  partyB: {
    name: string;
    role: string;
    avatar: string;
    initialStatement: string;
    hiddenNeed: string;
  };
  neutralizedSummary: string;
  aiMediationDialogue: {
    speaker: 'ai' | 'partyA' | 'partyB';
    text: string;
    note?: string;
    language?: string;
    translated?: string;
  }[];
  generatedAgreement: {
    points: string[];
    bindingType: string;
    resolutionTimeMin: number;
    satisfactionScore: number;
  };
}

export interface DesignToken {
  name: string;
  category: 'color' | 'typography' | 'spacing' | 'radius' | 'shadow';
  token: string;
  value: string;
  usage: string;
  wcagContrast?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: 'legal' | 'privacy' | 'process' | 'pricing';
}
