import { Currency } from '@/types/database';

export interface HederaTransactionResult {
  transactionId: string;
  transactionHash: string;
  success: boolean;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  timestamp: Date;
  gasUsed?: number;
  networkFee?: number;
  memo?: string;
}

export interface AccountInfo {
  accountId: string;
  balance: number;
  currency: Currency;
  isFrozen: boolean;
  transactions: number;
  createdAt: Date;
}

export interface DonationReceipt {
  donationId: string;
  transactionId: string;
  amount: number;
  currency: Currency;
  recipient: string;
  donor?: string;
  timestamp: Date;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  memo: string;
  networkFee: number;
  serviceFee: number;
  totalAmount: number;
}

export interface NetworkStats {
  currentFee: number;
  averageGas: number;
  networkStatus: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  lastBlockTimestamp: Date;
  transactionCount: number;
}

class HederaService {
  private isInitialized = false;
  private client: any = null;
  private readonly NETWORK = 'testnet'; // 'testnet' | 'mainnet'
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;

  // Hedera account configuration (in production, use secure storage)
  private readonly OPERATOR_ACCOUNT_ID = process.env.EXPO_PUBLIC_HEDERA_OPERATOR_ACCOUNT;
  private readonly OPERATOR_PRIVATE_KEY = process.env.EXPO_PUBLIC_HEDERA_OPERATOR_PRIVATE_KEY;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Hedera Hashgraph Service...');

    try {
      // Dynamically import Hedera SDK (reduces bundle size)
      const { Client, AccountId, PrivateKey, Hbar, TransferTransaction } = await import('@hashgraph/sdk');

      // Configure client based on network
      this.client = Client.forName(this.NETWORK);
      
      if (this.OPERATOR_ACCOUNT_ID && this.OPERATOR_PRIVATE_KEY) {
        this.client.setOperator(
          AccountId.fromString(this.OPERATOR_ACCOUNT_ID),
          PrivateKey.fromString(this.OPERATOR_PRIVATE_KEY)
        );
      }

      this.isInitialized = true;
      console.log('✅ Hedera Service initialized successfully');
      
      // Verify connection
      await this.verifyConnection();
      
    } catch (error) {
      console.error('❌ Failed to initialize Hedera service:', error);
      throw new Error('Hedera service initialization failed');
    }
  }

  private async verifyConnection(): Promise<void> {
    try {
      const accountId = this.client.operatorAccountId;
      if (accountId) {
        const balance = await this.getAccountBalance(accountId.toString());
        console.log(`💰 Operator account balance: ${balance} HBAR`);
      }
    } catch (error) {
      console.warn('⚠️ Could not verify operator account balance:', error);
    }
  }

  async sendDonation(
    recipientWalletAddress: string,
    amount: number,
    currency: Currency,
    donorInfo?: { name?: string; email?: string },
    memo?: string
  ): Promise<HederaTransactionResult> {
    await this.initialize();

    console.log(`💸 Processing donation: ${amount} ${currency} to ${recipientWalletAddress}`);

    try {
      // Validate inputs
      this.validateTransaction(recipientWalletAddress, amount, currency);

      const startTime = Date.now();
      
      let transactionResult: HederaTransactionResult;

      if (__DEV__) {
        // Use mock transaction in development
        transactionResult = await this.mockSendDonation(recipientWalletAddress, amount, currency, memo);
      } else {
        // Use real Hedera transaction in production
        transactionResult = await this.executeHederaTransaction(recipientWalletAddress, amount, currency, memo);
      }

      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Donation completed in ${processingTime}ms`, {
        transactionId: transactionResult.transactionId,
        amount,
        currency,
      });

      // Generate donation receipt
      await this.generateDonationReceipt(transactionResult, recipientWalletAddress, amount, currency, donorInfo);

      return transactionResult;

    } catch (error) {
      console.error('❌ Donation failed:', error);
      throw new Error(`Donation processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeHederaTransaction(
    recipient: string,
    amount: number,
    currency: Currency,
    memo?: string
  ): Promise<HederaTransactionResult> {
    const { TransferTransaction, Hbar, AccountId } = await import('@hashgraph/sdk');

    try {
      // Convert amount to tinybars (1 HBAR = 100,000,000 tinybars)
      const amountInTinybars = this.convertToTinybars(amount, currency);

      // Create transfer transaction
      const transaction = new TransferTransaction()
        .addHbarTransfer(this.client.operatorAccountId!, Hbar.fromTinybars(-amountInTinybars)) // Deduct from sender
        .addHbarTransfer(AccountId.fromString(recipient), Hbar.fromTinybars(amountInTinybars)) // Add to recipient
        .setTransactionMemo(memo || `Medical donation via AfriMed - ${new Date().toISOString()}`)
        .setMaxTransactionFee(Hbar.from(2)); // Set reasonable max fee

      // Execute transaction
      const txResponse = await transaction.execute(this.client);
      
      // Get receipt to confirm success
      const receipt = await txResponse.getReceipt(this.client);

      return {
        transactionId: txResponse.transactionId.toString(),
        transactionHash: txResponse.transactionHash.toString(),
        success: receipt.status.toString() === 'SUCCESS',
        status: receipt.status.toString() as any,
        timestamp: new Date(),
        gasUsed: receipt.gasUsed?.toNumber(),
        networkFee: transaction.transactionFee?.toNumber(),
        memo: memo,
      };

    } catch (error) {
      console.error('Hedera transaction execution failed:', error);
      throw error;
    }
  }

  private async mockSendDonation(
    recipient: string,
    amount: number,
    currency: Currency,
    memo?: string
  ): Promise<HederaTransactionResult> {
    await this.delay(1500 + Math.random() * 1000);

    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate in mock
      throw new Error('Mock transaction failed: Network congestion');
    }

    const transactionId = `0.0.${Math.floor(1000000 + Math.random() * 9000000)}@${Math.floor(Date.now() / 1000000)}`;
    const transactionHash = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)).join('')}`;

    return {
      transactionId,
      transactionHash,
      success: true,
      status: 'SUCCESS',
      timestamp: new Date(),
      gasUsed: Math.floor(50000 + Math.random() * 50000),
      networkFee: Math.floor(10000 + Math.random() * 20000),
      memo: memo || `Medical donation - ${new Date().toLocaleDateString()}`,
    };
  }

  async verifyTransaction(transactionId: string): Promise<HederaTransactionResult> {
    await this.initialize();

    console.log(`🔍 Verifying transaction: ${transactionId}`);

    try {
      if (__DEV__) {
        await this.delay(800);
        return {
          transactionId,
          transactionHash: `0x${Array.from({ length: 64 }, () => 
            Math.floor(Math.random() * 16).toString(16)).join('')}`,
          success: true,
          status: 'SUCCESS',
          timestamp: new Date(Date.now() - Math.random() * 60000),
          gasUsed: Math.floor(50000 + Math.random() * 50000),
          networkFee: Math.floor(10000 + Math.random() * 20000),
        };
      }

      const { TransactionId, TransactionReceiptQuery } = await import('@hashgraph/sdk');
      
      const txId = TransactionId.fromString(transactionId);
      const receipt = await new TransactionReceiptQuery()
        .setTransactionId(txId)
        .execute(this.client);

      return {
        transactionId,
        transactionHash: '', // Hash would come from transaction record query
        success: receipt.status.toString() === 'SUCCESS',
        status: receipt.status.toString() as any,
        timestamp: new Date(),
        gasUsed: receipt.gasUsed?.toNumber(),
      };

    } catch (error) {
      console.error('Transaction verification failed:', error);
      throw new Error(`Failed to verify transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAccountBalance(walletAddress: string): Promise<number> {
    await this.initialize();

    console.log(`💰 Fetching balance for: ${walletAddress}`);

    try {
      if (__DEV__) {
        await this.delay(300);
        return Math.random() * 1000;
      }

      const { AccountId, AccountBalanceQuery } = await import('@hashgraph/sdk');
      
      const accountId = AccountId.fromString(walletAddress);
      const balance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(this.client);

      return balance.hbars.toNumber();

    } catch (error) {
      console.error('Balance query failed:', error);
      throw new Error(`Failed to fetch account balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAccountInfo(walletAddress: string): Promise<AccountInfo> {
    await this.initialize();

    try {
      const { AccountId, AccountInfoQuery } = await import('@hashgraph/sdk');
      
      const accountId = AccountId.fromString(walletAddress);
      const info = await new AccountInfoQuery()
        .setAccountId(accountId)
        .execute(this.client);

      return {
        accountId: walletAddress,
        balance: info.balance.hbars.toNumber(),
        currency: 'HBAR', // Hedera only uses HBAR
        isFrozen: info.isFrozen || false,
        transactions: 0, // Would need additional query
        createdAt: new Date(info.autoRenewPeriod?.toDate() || Date.now()),
      };

    } catch (error) {
      console.error('Account info query failed:', error);
      throw new Error(`Failed to fetch account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getNetworkStats(): Promise<NetworkStats> {
    await this.initialize();

    try {
      // In a real implementation, you might query network status
      // For now, return mock data with realistic values
      return {
        currentFee: 0.0001,
        averageGas: 50000,
        networkStatus: 'OPERATIONAL',
        lastBlockTimestamp: new Date(),
        transactionCount: Math.floor(1000 + Math.random() * 5000),
      };
    } catch (error) {
      console.error('Network stats query failed:', error);
      throw new Error('Failed to fetch network statistics');
    }
  }

  async generateDonationReceipt(
    transaction: HederaTransactionResult,
    recipient: string,
    amount: number,
    currency: Currency,
    donorInfo?: { name?: string; email?: string }
  ): Promise<DonationReceipt> {
    const serviceFee = this.calculateServiceFee(amount);
    const networkFee = transaction.netFee || 0;

    const receipt: DonationReceipt = {
      donationId: `DON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId: transaction.transactionId,
      amount,
      currency,
      recipient,
      donor: donorInfo?.name || 'Anonymous Donor',
      timestamp: transaction.timestamp,
      status: transaction.success ? 'COMPLETED' : 'FAILED',
      memo: transaction.memo || `Medical donation - ${amount} ${currency}`,
      networkFee,
      serviceFee,
      totalAmount: amount + serviceFee + networkFee,
    };

    // In production, you might save this to a database
    console.log('📄 Generated donation receipt:', receipt);
    
    return receipt;
  }

  private calculateServiceFee(amount: number): number {
    // 2.5% service fee with a minimum of $0.50 equivalent
    const feePercentage = 0.025;
    const minFee = 0.50;
    const calculatedFee = amount * feePercentage;
    return Math.max(calculatedFee, minFee);
  }

  private convertToTinybars(amount: number, currency: Currency): number {
    // Simplified conversion - in production, use real exchange rates
    const exchangeRates: Record<Currency, number> = {
      USD: 0.05, // 1 USD = 0.05 HBAR (example rate)
      HBAR: 1,
      EUR: 0.06,
      GBP: 0.07,
    };

    const hbarAmount = amount * (exchangeRates[currency] || 1);
    return Math.floor(hbarAmount * 100000000); // Convert to tinybars
  }

  private validateTransaction(recipient: string, amount: number, currency: Currency): void {
    if (!recipient || !recipient.startsWith('0.0.')) {
      throw new Error('Invalid recipient wallet address');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    if (!currency) {
      throw new Error('Currency is required');
    }

    // Additional validation could include:
    // - Minimum amount checks
    // - Recipient account existence verification
    // - Regulatory compliance checks
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup method
  async shutdown(): Promise<void> {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    this.isInitialized = false;
    console.log('🛑 Hedera Service shutdown complete');
  }
}

// Create and export singleton instance
export const hederaService = new HederaService();

// Utility functions for Hedera operations
export const HederaUtils = {
  validateAccountId: (accountId: string): boolean => {
    return /^0\.0\.\d+$/.test(accountId);
  },

  formatHbarAmount: (amount: number): string => {
    return `${amount.toFixed(2)} ℏ`;
  },

  generateTransactionMemo: (purpose: string, metadata?: Record<string, any>): string => {
    const baseMemo = `AfriMed: ${purpose}`;
    if (metadata) {
      return `${baseMemo} - ${JSON.stringify(metadata)}`;
    }
    return baseMemo;
  },

  calculateEstimatedFee: (amount: number, currency: Currency): number => {
    const serviceFee = Math.max(amount * 0.025, 0.50);
    const networkFee = 0.0001; // Estimated network fee
    return serviceFee + networkFee;
  },
};