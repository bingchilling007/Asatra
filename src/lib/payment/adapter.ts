export type PaymentResult = {
  success: boolean;
  transactionId?: string;
  error?: string;
};

export interface PaymentGateway {
  charge(amount: number, currency: string, method: string, details: any): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<PaymentResult>;
}

// Mock Implementation for MVP
export class MockPaymentGateway implements PaymentGateway {
  async charge(amount: number, currency: string, method: string, details: any): Promise<PaymentResult> {
    console.log(`Processing mock payment: ${amount} ${currency} via ${method}`);
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate randomness or logic (e.g., specific amount triggers failure)
    if (amount < 0) return { success: false, error: 'Invalid amount' };

    return { 
      success: true, 
      transactionId: `mock_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
    };
  }

  async refund(transactionId: string, amount: number): Promise<PaymentResult> {
    console.log(`Processing mock refund: ${amount} for txn ${transactionId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, transactionId: `mock_ref_${Date.now()}` };
  }
}

export const paymentAdapter = new MockPaymentGateway();
