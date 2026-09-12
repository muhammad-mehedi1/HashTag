export type AccountLimitType = '2k Verified' | '250 Limit Verified' | '50 Limit' | 'Unlimited Verified';
export type AccountStatus = 'Available' | 'Sold' | 'Unsold';
export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'binance' | 'wallet';

export interface BMAccount {
  id: string;
  accountId: string;
  title: string;
  password: string;
  verifiedStatus: AccountLimitType | string;
  dailyLimit: string;
  cookies: string;
  outlookCookies: string;
  twoFactorSecret: string;
  priceUSD: number;
  priceBDT: number;
  status: AccountStatus;
  date: string;
  notes: string;
  features: string[];
}

export interface PaymentGatewayConfig {
  bkash: {
    number: string;
    type: 'Personal' | 'Merchant' | 'Agent';
    instructions: string;
  };
  nagad: {
    number: string;
    type: 'Personal' | 'Merchant';
    instructions: string;
  };
  rocket: {
    number: string;
    type: 'Personal' | 'Agent';
    instructions: string;
  };
  binance: {
    payId: string;
    usdtAddress: string;
    network: 'TRC20' | 'BEP20';
    instructions: string;
  };
  usdToBdtRate: number;
}

export interface Order {
  id: string;
  buyerUid: string;
  buyerPhoneOrContact?: string;
  accountId: string;
  accountTitle: string;
  accountType: string;
  amountBDT: number;
  amountUSD: number;
  currencyPaid: 'BDT' | 'USD';
  paymentMethod: PaymentMethod;
  senderNumberOrId: string;
  trxId: string;
  adminMatchedTrxId?: string;
  status: 'pending' | 'completed' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  matchedAt?: string;
  unlockedAccount?: BMAccount;
}

export interface DepositRequest {
  id: string;
  buyerUid: string;
  amountBDT: number;
  amountUSD: number;
  paymentMethod: PaymentMethod;
  senderNumberOrId: string;
  trxId: string;
  adminMatchedTrxId?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface BuyerProfile {
  uid: string;
  name: string;
  contact: string;
  balanceBDT: number;
  balanceUSD: number;
  createdAt: string;
}

export interface BuyerUser {
  uid: string;
  password: string; // Plaintext/recoverable for admin lookup when buyer forgets
  name?: string;
  contact?: string;
  balanceBDT: number;
  balanceUSD: number;
  createdAt: string;
  lastLoginAt?: string;
}
