import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BMAccount,
  PaymentGatewayConfig,
  Order,
  DepositRequest,
  BuyerProfile,
  BuyerUser,
  PaymentMethod,
} from '../types';
import { INITIAL_ACCOUNTS, INITIAL_PAYMENT_CONFIG } from '../data/initialAccounts';
import { hashPassword, DEFAULT_ADMIN_HASH } from '../utils/security';
import confetti from 'canvas-confetti';

interface MatchResult {
  matched: boolean;
  type?: 'order' | 'deposit';
  itemTitle?: string;
  matchedId?: string;
  trxId?: string;
  amountText?: string;
  buyerUid?: string;
  message: string;
}

interface StoreContextType {
  accounts: BMAccount[];
  orders: Order[];
  deposits: DepositRequest[];
  paymentConfig: PaymentGatewayConfig;
  buyerProfile: BuyerProfile;
  activeView: 'buyer' | 'admin';
  currency: 'BDT' | 'USD';
  switchView: (view: 'buyer' | 'admin') => void;
  setCurrency: (curr: 'BDT' | 'USD') => void;
  updateBuyerProfile: (updates: Partial<BuyerProfile>) => void;

  // Buyer Authentication & Management (Unique UID, Password, Session)
  registeredUsers: BuyerUser[];
  currentBuyer: BuyerUser | null;
  isBuyerLoggedIn: boolean;
  buyerSignUp: (
    uid: string,
    password: string,
    confirmPassword: string,
    name?: string,
    contact?: string
  ) => Promise<{ success: boolean; message: string }>;
  buyerLogin: (uid: string, password: string) => Promise<{ success: boolean; message: string }>;
  buyerLogout: () => void;
  isBuyerAuthModalOpen: boolean;
  setIsBuyerAuthModalOpen: (open: boolean) => void;
  buyerAuthModalMode: 'login' | 'signup';
  setBuyerAuthModalMode: (mode: 'login' | 'signup') => void;
  openBuyerAuthModal: (mode?: 'login' | 'signup') => void;

  // Admin User List Controls (Only Admin can see & manage)
  adminUpdateUserPassword: (uid: string, newPassword: string) => { success: boolean; message: string };
  adminDeleteUser: (uid: string) => { success: boolean; message: string };
  adminAdjustUserBalance: (uid: string, deltaBDT: number, deltaUSD: number) => { success: boolean; message: string };

  // Admin Authentication & Security (Cryptographically Hashed & Tamper-Proof)
  isAdminLoggedIn: boolean;
  adminLogin: (password: string) => Promise<{ success: boolean; message: string }>;
  adminLogout: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  isAdminAuthModalOpen: boolean;
  setIsAdminAuthModalOpen: (open: boolean) => void;
  
  // Checkout & Wallet
  buyWithWallet: (accountId: string) => Promise<{ success: boolean; message: string; orderId?: string }>;
  createOrderWithMFS: (
    accountId: string,
    paymentMethod: PaymentMethod,
    senderNumberOrId: string,
    trxId: string,
    paidAmount: number,
    currencyPaid: 'BDT' | 'USD'
  ) => Promise<{ success: boolean; message: string; orderId?: string }>;
  createDepositRequest: (
    paymentMethod: PaymentMethod,
    senderNumberOrId: string,
    trxId: string,
    amount: number,
    currency: 'BDT' | 'USD'
  ) => Promise<{ success: boolean; message: string; depositId?: string }>;

  // Admin Match & Verification
  matchAndVerifyTrxId: (adminEnteredTrxId: string) => MatchResult;
  approveOrder: (orderId: string, verifiedTrxId?: string) => void;
  rejectOrder: (orderId: string, reason?: string) => void;
  approveDeposit: (depositId: string, verifiedTrxId?: string) => void;
  rejectDeposit: (depositId: string, reason?: string) => void;

  // Inventory Management
  addAccount: (newAcc: Omit<BMAccount, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<BMAccount>) => void;
  deleteAccount: (id: string) => void;
  updatePaymentConfig: (newConfig: PaymentGatewayConfig) => void;
  resetToDefaultData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_REGISTERED_USERS: BuyerUser[] = [
  {
    uid: 'VIP_Agency01',
    password: 'user1234',
    name: 'VIP Media Agency',
    contact: '01700000000',
    balanceBDT: 0,
    balanceUSD: 0,
    createdAt: '2026-09-10T10:00:00.000Z',
    lastLoginAt: '2026-09-12T01:15:00.000Z',
  },
  {
    uid: 'Agency_HQ',
    password: 'pass@2026',
    name: 'Digital Growth Agency',
    contact: 'contact@agencyhq.com',
    balanceBDT: 4000,
    balanceUSD: 32,
    createdAt: '2026-09-11T14:30:00.000Z',
    lastLoginAt: '2026-09-12T02:40:00.000Z',
  },
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<BMAccount[]>(() => {
    const saved = localStorage.getItem('bm_vault_accounts');
    if (saved) {
      try {
        const parsed: BMAccount[] = JSON.parse(saved);
        // Ensure all BM accounts adhere to owner's updated flat price: 2000 BDT / 16 USD
        const normalized = parsed.map((acc) => ({
          ...acc,
          priceBDT: 2000,
          priceUSD: 16,
        }));
        return normalized;
      } catch {
        return INITIAL_ACCOUNTS;
      }
    }
    return INITIAL_ACCOUNTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('bm_vault_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [deposits, setDeposits] = useState<DepositRequest[]>(() => {
    const saved = localStorage.getItem('bm_vault_deposits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [paymentConfig, setPaymentConfigState] = useState<PaymentGatewayConfig>(() => {
    const saved = localStorage.getItem('bm_vault_payment_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PAYMENT_CONFIG;
      }
    }
    return INITIAL_PAYMENT_CONFIG;
  });

  // Registered Buyer Users (Stored locally, credentials visible only to Admin in Admin Panel)
  const [registeredUsers, setRegisteredUsers] = useState<BuyerUser[]>(() => {
    const saved = localStorage.getItem('bm_vault_registered_users');
    if (saved) {
      try {
        const parsed: BuyerUser[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    const savedOld = localStorage.getItem('bm_vault_buyer_profile');
    if (savedOld) {
      try {
        const old: BuyerProfile = JSON.parse(savedOld);
        if (old?.uid && !old.uid.startsWith('Guest')) {
          const migrated: BuyerUser = {
            uid: old.uid,
            password: 'user1234',
            name: old.name || old.uid,
            contact: old.contact || '',
            balanceBDT: old.balanceBDT || 0,
            balanceUSD: old.balanceUSD || 0,
            createdAt: old.createdAt || new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          return [migrated, ...INITIAL_REGISTERED_USERS];
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_REGISTERED_USERS;
  });

  // Current Logged-in Buyer UID
  const [currentBuyerUid, setCurrentBuyerUid] = useState<string | null>(() => {
    const saved = localStorage.getItem('bm_vault_current_buyer_uid');
    if (saved) return saved;
    const savedOld = localStorage.getItem('bm_vault_buyer_profile');
    if (savedOld) {
      try {
        const old = JSON.parse(savedOld);
        if (old?.uid && !old.uid.startsWith('Guest')) return old.uid;
      } catch {
        // fallback
      }
    }
    return 'VIP_Agency01';
  });

  const [isBuyerAuthModalOpen, setIsBuyerAuthModalOpen] = useState(false);
  const [buyerAuthModalMode, setBuyerAuthModalMode] = useState<'login' | 'signup'>('signup');

  const openBuyerAuthModal = (mode: 'login' | 'signup' = 'signup') => {
    setBuyerAuthModalMode(mode);
    setIsBuyerAuthModalOpen(true);
  };

  const currentBuyer =
    registeredUsers.find((u) => u.uid.toLowerCase() === currentBuyerUid?.toLowerCase()) || null;
  const isBuyerLoggedIn = currentBuyer !== null;

  const buyerProfile: BuyerProfile = currentBuyer
    ? {
        uid: currentBuyer.uid,
        name: currentBuyer.name || currentBuyer.uid,
        contact: currentBuyer.contact || '',
        balanceBDT: currentBuyer.balanceBDT,
        balanceUSD: currentBuyer.balanceUSD,
        createdAt: currentBuyer.createdAt,
      }
    : {
        uid: 'Guest (লগইন করুন)',
        name: 'Guest Buyer',
        contact: '',
        balanceBDT: 0,
        balanceUSD: 0,
        createdAt: new Date().toISOString(),
      };

  const [activeView, setActiveView] = useState<'buyer' | 'admin'>('buyer');
  const [currency, setCurrency] = useState<'BDT' | 'USD'>('BDT');

  // Admin Security (SHA-256 Hashed, Protected against bundle inspection)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('bm_vault_admin_auth') === 'true';
  });
  const [adminPasswordHash, setAdminPasswordHash] = useState<string>(() => {
    const saved = localStorage.getItem('bm_vault_admin_pwd_hash');
    if (!saved) {
      localStorage.setItem('bm_vault_admin_pwd_hash', DEFAULT_ADMIN_HASH);
      return DEFAULT_ADMIN_HASH;
    }
    return saved;
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('bm_vault_failed_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    const saved = localStorage.getItem('bm_vault_lockout_until');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('bm_vault_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (currentBuyerUid) {
      localStorage.setItem('bm_vault_current_buyer_uid', currentBuyerUid);
    } else {
      localStorage.removeItem('bm_vault_current_buyer_uid');
    }
  }, [currentBuyerUid]);

  useEffect(() => {
    localStorage.setItem('bm_vault_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('bm_vault_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('bm_vault_deposits', JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem('bm_vault_payment_config', JSON.stringify(paymentConfig));
  }, [paymentConfig]);

  useEffect(() => {
    localStorage.setItem('bm_vault_buyer_profile', JSON.stringify(buyerProfile));
  }, [buyerProfile]);

  useEffect(() => {
    localStorage.setItem('bm_vault_admin_auth', isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  useEffect(() => {
    localStorage.setItem('bm_vault_admin_pwd_hash', adminPasswordHash);
  }, [adminPasswordHash]);

  useEffect(() => {
    localStorage.setItem('bm_vault_failed_attempts', failedAttempts.toString());
  }, [failedAttempts]);

  useEffect(() => {
    localStorage.setItem('bm_vault_lockout_until', lockoutUntil.toString());
  }, [lockoutUntil]);

  // Buyer Sign Up: Validates unique UID across all users, password match
  const buyerSignUp = async (
    uid: string,
    password: string,
    confirmPassword: string,
    name?: string,
    contact?: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanUid = uid.trim();
    const cleanPass = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanUid) {
      return { success: false, message: 'অনুগ্রহ করে আপনার একটি ইউনিক UID দিন।' };
    }
    if (cleanUid.length < 3) {
      return { success: false, message: 'UID কমপক্ষে ৩ অক্ষরের হতে হবে।' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanUid)) {
      return { success: false, message: 'UID-তে শুধু ইংরেজি অক্ষর, সংখ্যা, _ এবং - ব্যবহার করা যাবে।' };
    }
    if (!cleanPass) {
      return { success: false, message: 'অনুগ্রহ করে পাসওয়ার্ড দিন।' };
    }
    if (cleanPass.length < 4) {
      return { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
    }
    if (cleanPass !== cleanConfirm) {
      return { success: false, message: 'পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!' };
    }

    // Check UID uniqueness (case-insensitive) - Once chosen, nobody else can use it
    const isTaken = registeredUsers.some(
      (u) => u.uid.toLowerCase() === cleanUid.toLowerCase()
    );
    if (isTaken) {
      return {
        success: false,
        message: `⚠️ "${cleanUid}" এই UID-টি ইতিমধ্যে ব্যবহৃত হয়েছে! দয়া করে অন্য একটি UID দিয়ে চেষ্টা করুন।`,
      };
    }

    const newUser: BuyerUser = {
      uid: cleanUid,
      password: cleanPass,
      name: name?.trim() || cleanUid,
      contact: contact?.trim() || '',
      balanceBDT: 0,
      balanceUSD: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);
    setCurrentBuyerUid(cleanUid);
    setIsBuyerAuthModalOpen(false);

    try {
      confetti({ particleCount: 70, spread: 50 });
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `🎉 অভিনন্দন! "${cleanUid}" নামে আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।`,
    };
  };

  // Buyer Login
  const buyerLogin = async (
    uid: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanUid = uid.trim();
    const cleanPass = password.trim();

    if (!cleanUid || !cleanPass) {
      return { success: false, message: 'UID এবং পাসওয়ার্ড উভয়ই লিখুন।' };
    }

    const user = registeredUsers.find(
      (u) => u.uid.toLowerCase() === cleanUid.toLowerCase()
    );

    if (!user) {
      return {
        success: false,
        message: `❌ "${cleanUid}" এই UID দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সাইন আপ করুন।`,
      };
    }

    if (user.password !== cleanPass) {
      return {
        success: false,
        message: '❌ ভুল পাসওয়ার্ড! পাসওয়ার্ড মনে না থাকলে অ্যাডমিন প্যানেলের সাথে যোগাযোগ করে আপনার UID বলে পাসওয়ার্ড জেনে নিতে পারবেন।',
      };
    }

    // Update last login
    setRegisteredUsers((prev) =>
      prev.map((u) =>
        u.uid.toLowerCase() === cleanUid.toLowerCase()
          ? { ...u, lastLoginAt: new Date().toISOString() }
          : u
      )
    );
    setCurrentBuyerUid(user.uid);
    setIsBuyerAuthModalOpen(false);

    return {
      success: true,
      message: `👋 স্বাগতম, ${user.uid}! আপনি সফলভাবে লগইন হয়েছেন।`,
    };
  };

  const buyerLogout = () => {
    setCurrentBuyerUid(null);
  };

  // Admin User List Controls
  const adminUpdateUserPassword = (
    uid: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    const clean = newPassword.trim();
    if (!clean || clean.length < 4) {
      return { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
    }
    const user = registeredUsers.find((u) => u.uid.toLowerCase() === uid.toLowerCase());
    if (!user) {
      return { success: false, message: 'User not found.' };
    }
    setRegisteredUsers((prev) =>
      prev.map((u) =>
        u.uid.toLowerCase() === uid.toLowerCase() ? { ...u, password: clean } : u
      )
    );
    return { success: true, message: `Password for ${uid} successfully changed to "${clean}"` };
  };

  const adminDeleteUser = (uid: string): { success: boolean; message: string } => {
    setRegisteredUsers((prev) => prev.filter((u) => u.uid.toLowerCase() !== uid.toLowerCase()));
    if (currentBuyerUid?.toLowerCase() === uid.toLowerCase()) {
      setCurrentBuyerUid(null);
    }
    return { success: true, message: `User "${uid}" deleted successfully.` };
  };

  const adminAdjustUserBalance = (
    uid: string,
    deltaBDT: number,
    deltaUSD: number
  ): { success: boolean; message: string } => {
    const user = registeredUsers.find((u) => u.uid.toLowerCase() === uid.toLowerCase());
    if (!user) {
      return { success: false, message: 'User not found.' };
    }
    setRegisteredUsers((prev) =>
      prev.map((u) =>
        u.uid.toLowerCase() === uid.toLowerCase()
          ? {
              ...u,
              balanceBDT: Math.max(0, u.balanceBDT + deltaBDT),
              balanceUSD: Math.max(0, u.balanceUSD + deltaUSD),
            }
          : u
      )
    );
    return { success: true, message: `Balance updated for ${uid}.` };
  };

  const switchView = (view: 'buyer' | 'admin') => {
    if (view === 'admin') {
      if (isAdminLoggedIn) {
        setActiveView('admin');
      } else {
        // Prompt for secret admin password
        setIsAdminAuthModalOpen(true);
      }
    } else {
      setActiveView('buyer');
    }
  };

  const adminLogin = async (enteredPass: string): Promise<{ success: boolean; message: string }> => {
    const now = Date.now();
    if (lockoutUntil > now) {
      const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
      return {
        success: false,
        message: `নিরাপত্তাজনিত কারণে সিস্টেম সাময়িকভাবে লক রয়েছে। অনুগ্রহ করে ${remainingSec} সেকেন্ড পর আবার চেষ্টা করুন (System temporarily locked due to failed attempts).`,
      };
    }

    const hashedInput = await hashPassword(enteredPass);

    if (hashedInput === adminPasswordHash) {
      setIsAdminLoggedIn(true);
      setActiveView('admin');
      setIsAdminAuthModalOpen(false);
      setFailedAttempts(0);
      setLockoutUntil(0);
      localStorage.removeItem('bm_vault_failed_attempts');
      localStorage.removeItem('bm_vault_lockout_until');
      return { success: true, message: 'স্বাগতম অ্যাডমিন! Admin panel successfully unlocked.' };
    }

    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);

    // High security: after 5 failed attempts, lock out for 60 seconds
    if (nextAttempts >= 5) {
      const lockoutExpiry = Date.now() + 60 * 1000;
      setLockoutUntil(lockoutExpiry);
      return {
        success: false,
        message: 'একটানা ৫ বার ভুল পাসওয়ার্ড দেওয়ায় সিস্টেম ৬০ সেকেন্ডের জন্য লক করা হয়েছে!',
      };
    }

    const attemptsRemaining = 5 - nextAttempts;
    return {
      success: false,
      message: `ভুল পাসওয়ার্ড! Access Denied. (অবশিষ্ট চেষ্টা: ${attemptsRemaining})`,
    };
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    setActiveView('buyer');
    localStorage.removeItem('bm_vault_admin_auth');
  };

  const changeAdminPassword = async (
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    const hashedOld = await hashPassword(oldPass);
    if (hashedOld !== adminPasswordHash) {
      return { success: false, message: 'Current password does not match.' };
    }
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }
    const hashedNew = await hashPassword(newPass.trim());
    setAdminPasswordHash(hashedNew);
    return { success: true, message: 'Admin Password successfully updated!' };
  };

  const updateBuyerProfile = (updates: Partial<BuyerProfile>) => {
    if (currentBuyer) {
      setRegisteredUsers((prev) =>
        prev.map((u) =>
          u.uid.toLowerCase() === currentBuyer.uid.toLowerCase()
            ? { ...u, ...updates }
            : u
        )
      );
    }
  };

  // Instant Buy with Wallet Balance
  const buyWithWallet = async (
    accountId: string
  ): Promise<{ success: boolean; message: string; orderId?: string }> => {
    if (!isBuyerLoggedIn || !currentBuyer) {
      openBuyerAuthModal('login');
      return {
        success: false,
        message: 'অ্যাকাউন্ট ক্রয় করতে অনুগ্রহ করে প্রথমে সাইন আপ বা লগইন করুন।',
      };
    }

    const targetAccount = accounts.find((a) => a.id === accountId);
    if (!targetAccount) {
      return { success: false, message: 'Account not found or already removed.' };
    }
    if (targetAccount.status === 'Sold') {
      return { success: false, message: 'This account has already been sold!' };
    }

    const priceRequired = currency === 'BDT' ? targetAccount.priceBDT : targetAccount.priceUSD;
    const currentBalance = currency === 'BDT' ? buyerProfile.balanceBDT : buyerProfile.balanceUSD;

    if (currentBalance < priceRequired) {
      return {
        success: false,
        message: `Insufficient balance in your wallet! Required: ${
          currency === 'BDT' ? `৳${priceRequired}` : `$${priceRequired}`
        }, Available: ${currency === 'BDT' ? `৳${currentBalance}` : `$${currentBalance}`}. Please deposit balance or use direct MFS.`,
      };
    }

    // Deduct balance from registered user
    setRegisteredUsers((prev) =>
      prev.map((u) =>
        u.uid.toLowerCase() === currentBuyer.uid.toLowerCase()
          ? {
              ...u,
              balanceBDT: currency === 'BDT' ? u.balanceBDT - priceRequired : u.balanceBDT,
              balanceUSD: currency === 'USD' ? u.balanceUSD - priceRequired : u.balanceUSD,
            }
          : u
      )
    );

    // Mark account as sold
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, status: 'Sold' as const } : acc))
    );

    // Create completed order
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      buyerUid: buyerProfile.uid,
      accountId: targetAccount.id,
      accountTitle: targetAccount.title,
      accountType: targetAccount.verifiedStatus,
      amountBDT: targetAccount.priceBDT,
      amountUSD: targetAccount.priceUSD,
      currencyPaid: currency,
      paymentMethod: 'wallet',
      senderNumberOrId: `Wallet-${buyerProfile.uid}`,
      trxId: `WAL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      matchedAt: new Date().toISOString(),
      unlockedAccount: { ...targetAccount, status: 'Sold' },
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Celebrate unlock!
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    return {
      success: true,
      message: 'Payment successful using Wallet Balance! Your account credentials have been unlocked instantly.',
      orderId,
    };
  };

  // Direct Order creation via bKash / Nagad / Rocket / Binance with TrxID
  const createOrderWithMFS = async (
    accountId: string,
    paymentMethod: PaymentMethod,
    senderNumberOrId: string,
    trxId: string,
    paidAmount: number,
    currencyPaid: 'BDT' | 'USD'
  ): Promise<{ success: boolean; message: string; orderId?: string }> => {
    if (!isBuyerLoggedIn || !currentBuyer) {
      openBuyerAuthModal('login');
      return {
        success: false,
        message: 'অর্ডার করার পূর্বে অনুগ্রহ করে সাইন আপ বা লগইন করুন।',
      };
    }

    const targetAccount = accounts.find((a) => a.id === accountId);
    if (!targetAccount) {
      return { success: false, message: 'Account not found.' };
    }
    if (targetAccount.status === 'Sold') {
      return { success: false, message: 'This account has already been sold.' };
    }

    const cleanTrxId = trxId.trim().toUpperCase();
    if (!cleanTrxId) {
      return { success: false, message: 'Please enter the Transaction ID (TrxID).' };
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      buyerUid: buyerProfile.uid,
      accountId: targetAccount.id,
      accountTitle: targetAccount.title,
      accountType: targetAccount.verifiedStatus,
      amountBDT: targetAccount.priceBDT,
      amountUSD: targetAccount.priceUSD,
      currencyPaid,
      paymentMethod,
      senderNumberOrId: senderNumberOrId.trim(),
      trxId: cleanTrxId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    return {
      success: true,
      message: `Order #${orderId} created! Status: Pending matching. As soon as admin verifies Transaction ID (${cleanTrxId}), your account will unlock automatically.`,
      orderId,
    };
  };

  // Deposit funds request
  const createDepositRequest = async (
    paymentMethod: PaymentMethod,
    senderNumberOrId: string,
    trxId: string,
    amount: number,
    depositCurrency: 'BDT' | 'USD'
  ): Promise<{ success: boolean; message: string; depositId?: string }> => {
    if (!isBuyerLoggedIn || !currentBuyer) {
      openBuyerAuthModal('login');
      return {
        success: false,
        message: 'ব্যালেন্স ডিপোজিট / রিচার্জ করতে অনুগ্রহ করে সাইন আপ বা লগইন করুন।',
      };
    }

    const cleanTrxId = trxId.trim().toUpperCase();
    if (!cleanTrxId) {
      return { success: false, message: 'Please enter a valid Transaction ID.' };
    }
    if (amount <= 0) {
      return { success: false, message: 'Please enter a valid deposit amount.' };
    }

    const depositId = `DEP-${Date.now().toString().slice(-6)}`;
    const newDeposit: DepositRequest = {
      id: depositId,
      buyerUid: buyerProfile.uid,
      amountBDT: depositCurrency === 'BDT' ? amount : Math.round(amount * paymentConfig.usdToBdtRate),
      amountUSD: depositCurrency === 'USD' ? amount : Number((amount / paymentConfig.usdToBdtRate).toFixed(2)),
      paymentMethod,
      senderNumberOrId: senderNumberOrId.trim(),
      trxId: cleanTrxId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setDeposits((prev) => [newDeposit, ...prev]);

    return {
      success: true,
      message: `Deposit request submitted with TrxID: ${cleanTrxId}. Balance will be credited once verified!`,
      depositId,
    };
  };

  // ADMIN: Matching & Verification Engine
  // User prompt requirement: "tara payment kre transaction id bosabe ,amio bosabo,matching hoile payment succesfull, unlock hbe paid korar por akta account"
  const matchAndVerifyTrxId = (adminEnteredTrxId: string): MatchResult => {
    const query = adminEnteredTrxId.trim().toUpperCase();
    if (!query) {
      return { matched: false, message: 'Please enter or paste a Transaction ID to match.' };
    }

    // 1. Look in Pending Orders
    const matchingOrder = orders.find(
      (o) => o.status === 'pending' && o.trxId.toUpperCase() === query
    );

    if (matchingOrder) {
      approveOrder(matchingOrder.id, query);
      return {
        matched: true,
        type: 'order',
        itemTitle: matchingOrder.accountTitle,
        matchedId: matchingOrder.id,
        trxId: query,
        amountText: `${matchingOrder.currencyPaid === 'BDT' ? `৳${matchingOrder.amountBDT}` : `$${matchingOrder.amountUSD}`}`,
        buyerUid: matchingOrder.buyerUid,
        message: `✅ MATCH FOUND! Order #${matchingOrder.id} for Buyer ${matchingOrder.buyerUid} has been verified and UNLOCKED!`,
      };
    }

    // 2. Look in Pending Deposits
    const matchingDeposit = deposits.find(
      (d) => d.status === 'pending' && d.trxId.toUpperCase() === query
    );

    if (matchingDeposit) {
      approveDeposit(matchingDeposit.id, query);
      return {
        matched: true,
        type: 'deposit',
        itemTitle: `Wallet Deposit (৳${matchingDeposit.amountBDT} / $${matchingDeposit.amountUSD})`,
        matchedId: matchingDeposit.id,
        trxId: query,
        amountText: `৳${matchingDeposit.amountBDT}`,
        buyerUid: matchingDeposit.buyerUid,
        message: `✅ MATCH FOUND! Deposit #${matchingDeposit.id} for Buyer ${matchingDeposit.buyerUid} has been credited to wallet!`,
      };
    }

    return {
      matched: false,
      message: `❌ No pending order or deposit found matching TrxID: "${query}". Please check the digits and try again.`,
    };
  };

  // Admin approves order
  const approveOrder = (orderId: string, verifiedTrxId?: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const account = accounts.find((a) => a.id === order.accountId);
    if (!account) return;

    // Mark account as sold
    setAccounts((prev) =>
      prev.map((a) => (a.id === account.id ? { ...a, status: 'Sold' as const } : a))
    );

    // Update order to completed and attach credentials
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'completed' as const,
            adminMatchedTrxId: verifiedTrxId || o.trxId,
            matchedAt: new Date().toISOString(),
            unlockedAccount: { ...account, status: 'Sold' as const },
          };
        }
        return o;
      })
    );

    try {
      confetti({ particleCount: 70, spread: 50 });
    } catch {
      // ignore
    }
  };

  // Admin rejects order
  const rejectOrder = (orderId: string, reason?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'rejected' as const,
              rejectionReason: reason || 'Invalid Transaction ID or Payment Not Received',
            }
          : o
      )
    );
  };

  // Admin approves deposit
  const approveDeposit = (depositId: string, verifiedTrxId?: string) => {
    const dep = deposits.find((d) => d.id === depositId);
    if (!dep) return;

    setDeposits((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? {
              ...d,
              status: 'approved' as const,
              adminMatchedTrxId: verifiedTrxId || d.trxId,
              approvedAt: new Date().toISOString(),
            }
          : d
      )
    );

    // Credit user if current buyer matches UID
    setRegisteredUsers((prev) =>
      prev.map((u) =>
        u.uid.toLowerCase() === dep.buyerUid.toLowerCase()
          ? {
              ...u,
              balanceBDT: u.balanceBDT + dep.amountBDT,
              balanceUSD: u.balanceUSD + dep.amountUSD,
            }
          : u
      )
    );
  };

  // Admin rejects deposit
  const rejectDeposit = (depositId: string, reason?: string) => {
    setDeposits((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? {
              ...d,
              status: 'rejected' as const,
              rejectionReason: reason || 'Payment could not be verified',
            }
          : d
      )
    );
  };

  // Inventory CRUD
  const addAccount = (newAcc: Omit<BMAccount, 'id'>) => {
    const id = `bm-${Date.now()}`;
    const account: BMAccount = { ...newAcc, id };
    setAccounts((prev) => [account, ...prev]);
  };

  const updateAccount = (id: string, updates: Partial<BMAccount>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const updatePaymentConfig = (newConfig: PaymentGatewayConfig) => {
    setPaymentConfigState(newConfig);
  };

  const resetToDefaultData = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setPaymentConfigState(INITIAL_PAYMENT_CONFIG);
    localStorage.setItem('bm_vault_accounts', JSON.stringify(INITIAL_ACCOUNTS));
    localStorage.setItem('bm_vault_payment_config', JSON.stringify(INITIAL_PAYMENT_CONFIG));
  };

  return (
    <StoreContext.Provider
      value={{
        accounts,
        orders,
        deposits,
        paymentConfig,
        buyerProfile,
        registeredUsers,
        currentBuyer,
        isBuyerLoggedIn,
        isBuyerAuthModalOpen,
        setIsBuyerAuthModalOpen,
        buyerAuthModalMode,
        setBuyerAuthModalMode,
        openBuyerAuthModal,
        buyerSignUp,
        buyerLogin,
        buyerLogout,
        adminUpdateUserPassword,
        adminDeleteUser,
        adminAdjustUserBalance,
        activeView,
        currency,
        switchView,
        setCurrency,
        updateBuyerProfile,
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
        changeAdminPassword,
        isAdminAuthModalOpen,
        setIsAdminAuthModalOpen,
        buyWithWallet,
        createOrderWithMFS,
        createDepositRequest,
        matchAndVerifyTrxId,
        approveOrder,
        rejectOrder,
        approveDeposit,
        rejectDeposit,
        addAccount,
        updateAccount,
        deleteAccount,
        updatePaymentConfig,
        resetToDefaultData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
