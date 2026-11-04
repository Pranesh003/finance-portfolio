import { BaseEntity, CurrencyCode } from './common';

export type FixedAssetType =
  | 'REAL_ESTATE_PRIMARY_RESIDENCE'
  | 'REAL_ESTATE_INVESTMENT'
  | 'VEHICLE'
  | 'ART_COLLECTIBLE'
  | 'JEWELRY'
  | 'PRIVATE_BUSINESS_EQUITY'
  | 'LAND'
  | 'OTHER_PHYSICAL_ASSET';

export interface FixedAsset extends BaseEntity {
  userId: string;
  name: string;
  assetType: FixedAssetType;
  purchaseDate: string;
  purchasePrice: number;
  estimatedCurrentValue: number;
  currency: CurrencyCode;
  appreciationRateAnnual?: number;
  depreciationRateAnnual?: number;
  address?: string;
  notes?: string;
  isInsured: boolean;
  linkedLiabilityId?: string; // e.g. linked mortgage
}

export type LiabilityType =
  | 'MORTGAGE'
  | 'AUTO_LOAN'
  | 'STUDENT_LOAN'
  | 'PERSONAL_LOAN'
  | 'CREDIT_CARD_DEBT'
  | 'BUSINESS_LOAN'
  | 'TAX_LIABILITY'
  | 'OTHER_DEBT';

export interface Liability extends BaseEntity {
  userId: string;
  name: string;
  liabilityType: LiabilityType;
  lenderName: string;
  originalPrincipal: number;
  remainingPrincipal: number;
  interestRateAnnual: number;
  monthlyPayment: number;
  currency: CurrencyCode;
  originationDate: string;
  expectedPayoffDate: string;
  linkedAssetId?: string; // e.g. linked property
}

export interface NetWorthSummary {
  userId: string;
  calculatedAt: string;
  currency: CurrencyCode;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetsByCategory: {
    liquidCash: number;
    investments: number;
    fixedAssets: number;
    cryptoAndCommodities: number;
  };
  liabilitiesByCategory: {
    mortgages: number;
    studentLoans: number;
    autoLoans: number;
    creditCards: number;
    other: number;
  };
}

