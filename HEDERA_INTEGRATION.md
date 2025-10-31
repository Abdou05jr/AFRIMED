# Hedera Blockchain Integration Guide

This document explains how to integrate Hedera Hashgraph for blockchain-based donation transparency.

## Overview

MedScan Africa uses Hedera for:
- Transparent donation transactions
- Immutable audit trail
- Smart contract-based fund releases
- Verification system for donation requests

## Hedera Service Location

The blockchain integration code is at:
```
/services/hederaService.ts
```

## Current Implementation

The service currently uses **mock transactions** for demonstration. You need to integrate the actual Hedera SDK.

## Setup Steps

### Step 1: Install Hedera SDK

```bash
npm install @hashgraph/sdk
npm install @hashgraph/hedera-wallet-connect
```

### Step 2: Get Hedera Testnet Account

1. Go to [Hedera Portal](https://portal.hedera.com/)
2. Create a testnet account
3. Get your Account ID and Private Key

### Step 3: Configure Environment Variables

Add to your `.env` file:

```env
HEDERA_ACCOUNT_ID=0.0.XXXXXXX
HEDERA_PRIVATE_KEY=302e020100300506032b65700422042...
HEDERA_NETWORK=testnet
```

### Step 4: Update hederaService.ts

Replace the mock implementation:

```typescript
import {
  Client,
  AccountId,
  PrivateKey,
  Hbar,
  TransferTransaction,
  TransactionReceipt,
  ContractCreateTransaction,
  ContractExecuteTransaction,
  ContractFunctionParameters
} from '@hashgraph/sdk';

class HederaService {
  private client: Client | null = null;

  async initialize() {
    if (this.client) return;

    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;

    if (!accountId || !privateKey) {
      throw new Error('Hedera credentials not configured');
    }

    // Create client for testnet
    this.client = Client.forTestnet();
    this.client.setOperator(
      AccountId.fromString(accountId),
      PrivateKey.fromString(privateKey)
    );

    console.log('Hedera client initialized');
  }

  async sendDonation(
    recipientWalletAddress: string,
    amount: number,
    currency: Currency
  ): Promise<HederaTransactionResult> {
    await this.initialize();

    try {
      // Convert USD to HBAR (example rate: 1 HBAR = $0.05)
      const hbarAmount = currency === 'USD' ? amount / 0.05 : amount;

      // Create transfer transaction
      const transaction = new TransferTransaction()
        .addHbarTransfer(
          this.client!.operatorAccountId!,
          new Hbar(-hbarAmount)
        )
        .addHbarTransfer(
          AccountId.fromString(recipientWalletAddress),
          new Hbar(hbarAmount)
        )
        .setTransactionMemo('MedScan Africa Donation');

      // Submit transaction
      const txResponse = await transaction.execute(this.client!);

      // Get receipt
      const receipt = await txResponse.getReceipt(this.client!);

      return {
        transactionId: txResponse.transactionId.toString(),
        transactionHash: txResponse.transactionHash.toString(),
        success: receipt.status.toString() === 'SUCCESS'
      };
    } catch (error) {
      console.error('Hedera transaction failed:', error);
      throw error;
    }
  }

  async verifyTransaction(transactionId: string): Promise<boolean> {
    await this.initialize();

    try {
      // Query transaction record
      const query = await new TransactionRecordQuery()
        .setTransactionId(TransactionId.fromString(transactionId))
        .execute(this.client!);

      return query.receipt.status.toString() === 'SUCCESS';
    } catch (error) {
      console.error('Transaction verification failed:', error);
      return false;
    }
  }

  async getAccountBalance(walletAddress: string): Promise<number> {
    await this.initialize();

    try {
      const query = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(walletAddress))
        .execute(this.client!);

      return query.hbars.toBigNumber().toNumber();
    } catch (error) {
      console.error('Balance query failed:', error);
      return 0;
    }
  }
}
```

## Smart Contract for Verified Donations

### Step 1: Create Solidity Contract

Create `contracts/DonationEscrow.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonationEscrow {
    struct DonationRequest {
        address payable beneficiary;
        uint256 targetAmount;
        uint256 raisedAmount;
        bool verified;
        bool released;
        address verifier;
    }

    mapping(bytes32 => DonationRequest) public requests;
    mapping(address => bool) public verifiers;
    address public admin;

    event RequestCreated(bytes32 indexed requestId, address beneficiary, uint256 targetAmount);
    event DonationReceived(bytes32 indexed requestId, address donor, uint256 amount);
    event RequestVerified(bytes32 indexed requestId, address verifier);
    event FundsReleased(bytes32 indexed requestId, uint256 amount);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Only verifier");
        _;
    }

    function addVerifier(address verifier) external onlyAdmin {
        verifiers[verifier] = true;
    }

    function createRequest(
        bytes32 requestId,
        address payable beneficiary,
        uint256 targetAmount
    ) external {
        require(requests[requestId].beneficiary == address(0), "Request exists");

        requests[requestId] = DonationRequest({
            beneficiary: beneficiary,
            targetAmount: targetAmount,
            raisedAmount: 0,
            verified: false,
            released: false,
            verifier: address(0)
        });

        emit RequestCreated(requestId, beneficiary, targetAmount);
    }

    function donate(bytes32 requestId) external payable {
        DonationRequest storage request = requests[requestId];
        require(request.beneficiary != address(0), "Request not found");
        require(!request.released, "Already released");

        request.raisedAmount += msg.value;
        emit DonationReceived(requestId, msg.sender, msg.value);
    }

    function verifyRequest(bytes32 requestId) external onlyVerifier {
        DonationRequest storage request = requests[requestId];
        require(request.beneficiary != address(0), "Request not found");
        require(!request.verified, "Already verified");

        request.verified = true;
        request.verifier = msg.sender;
        emit RequestVerified(requestId, msg.sender);
    }

    function releaseFunds(bytes32 requestId) external {
        DonationRequest storage request = requests[requestId];
        require(request.verified, "Not verified");
        require(!request.released, "Already released");
        require(request.raisedAmount > 0, "No funds");

        request.released = true;
        request.beneficiary.transfer(request.raisedAmount);
        emit FundsReleased(requestId, request.raisedAmount);
    }
}
```

### Step 2: Deploy Smart Contract

```typescript
async deployDonationContract(): Promise<string> {
  await this.initialize();

  // Compile contract bytecode
  const bytecode = '...'; // Your compiled contract bytecode

  // Create contract
  const transaction = new ContractCreateTransaction()
    .setBytecode(bytecode)
    .setGas(100000)
    .setConstructorParameters(new ContractFunctionParameters());

  const txResponse = await transaction.execute(this.client!);
  const receipt = await txResponse.getReceipt(this.client!);

  return receipt.contractId!.toString();
}
```

### Step 3: Interact with Smart Contract

```typescript
async createDonationRequest(
  contractId: string,
  requestId: string,
  beneficiary: string,
  targetAmount: number
): Promise<string> {
  await this.initialize();

  const transaction = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(100000)
    .setFunction(
      'createRequest',
      new ContractFunctionParameters()
        .addBytes32(Buffer.from(requestId))
        .addAddress(beneficiary)
        .addUint256(targetAmount)
    );

  const txResponse = await transaction.execute(this.client!);
  const receipt = await txResponse.getReceipt(this.client!);

  return txResponse.transactionId.toString();
}

async donateToRequest(
  contractId: string,
  requestId: string,
  amount: number
): Promise<string> {
  await this.initialize();

  const transaction = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(100000)
    .setPayableAmount(new Hbar(amount))
    .setFunction(
      'donate',
      new ContractFunctionParameters()
        .addBytes32(Buffer.from(requestId))
    );

  const txResponse = await transaction.execute(this.client!);
  return txResponse.transactionId.toString();
}
```

## Frontend Integration

### Connect Wallet

```typescript
import { HashConnect } from '@hashgraph/hedera-wallet-connect';

const hashconnect = new HashConnect();

async function connectWallet() {
  const appMetadata = {
    name: 'MedScan Africa',
    description: 'AI-Powered Medical Diagnostics',
    icon: 'https://medscan.africa/icon.png'
  };

  await hashconnect.init(appMetadata);

  const pairing = await hashconnect.connectToLocalWallet();
  return pairing.accountIds[0];
}
```

### Display Transaction History

```typescript
async function getTransactionHistory(accountId: string) {
  const response = await fetch(
    `https://testnet.mirrornode.hedera.com/api/v1/transactions?account.id=${accountId}`
  );
  const data = await response.json();
  return data.transactions;
}
```

## Testing on Testnet

1. Get testnet HBAR from [Hedera Testnet Faucet](https://portal.hedera.com/faucet)
2. Test transactions with small amounts
3. Verify on [HashScan Testnet Explorer](https://hashscan.io/testnet)

## Production Deployment

### Mainnet Configuration

```typescript
// Update for mainnet
this.client = Client.forMainnet();
```

### Security Best Practices

1. **Never expose private keys** in client-side code
2. Use **server-side signing** for production
3. Implement **multi-signature** for large transactions
4. Set up **transaction limits**
5. Enable **KYC verification** for compliance

## Fee Structure

Current Hedera fees (as of 2024):
- Transfer transaction: ~$0.0001
- Smart contract execution: ~$0.001
- Query: Free

## Monitoring & Analytics

Track donation metrics:

```typescript
async function getDonationStats() {
  const { data, error } = await supabase
    .from('donations')
    .select('amount, currency, hedera_transaction_hash')
    .not('hedera_transaction_hash', 'is', null);

  const totalDonated = data.reduce((sum, d) => sum + d.amount, 0);
  const totalTransactions = data.length;

  return { totalDonated, totalTransactions };
}
```

## Troubleshooting

### Common Issues

1. **Transaction timeout**: Increase gas limit
2. **Insufficient balance**: Check account HBAR balance
3. **Invalid signature**: Verify private key format
4. **Network errors**: Check Hedera network status

## Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [Hedera SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis)
- [Smart Contract Examples](https://github.com/hashgraph/hedera-smart-contracts)
- [HashScan Explorer](https://hashscan.io/)
