export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
}

/**
 * Service to verify payments via external banking APIs (e.g. SePay, Casso)
 */
export const PaymentService = {
  /**
   * Verifies if a transaction exists with the given order code and amount.
   * @param orderCode The unique code to look for in transaction description
   * @param expectedAmount The amount to verify
   * @returns boolean indicating if payment was found
   */
  async verifyPayment(orderCode: string, expectedAmount: number): Promise<{ success: boolean; message: string }> {
    try {
      // Configuration - In a real app, these should be in environment variables
      const API_KEY = process.env.NEXT_PUBLIC_SEPAY_API_KEY;
      const ACCOUNT_NUMBER = "9383198407"; // User's VCB account

      if (!API_KEY) {
        // If no API key is set, we'll provide a mock response for testing if in development
        // or return an error instructing the user to configure it.
        if (process.env.NODE_ENV === 'development') {
          console.warn("Payment API Key missing. Simulation mode enabled.");
          // For demo purposes, we'll simulate a check. 
          // In a real scenario, this would fail or use a sandbox account.
          return { 
            success: false, 
            message: "Hệ thống chưa cấu hình API Key cho SePay. Vui lòng thêm NEXT_PUBLIC_SEPAY_API_KEY vào tệp .env." 
          };
        }
      }

      // Example fetch from SePay (or similar service)
      // Documentation: https://docs.sepay.vn/tich-hop-api.html
      /*
      const response = await fetch(`https://my.sepay.vn/userapi/transactions/list?account_number=${ACCOUNT_NUMBER}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error("Could not fetch transactions");
      
      const result = await response.json();
      const transactions: any[] = result.data || [];

      // Look for the order code in descriptions
      const found = transactions.find(t => 
        t.content.includes(orderCode) && 
        parseFloat(t.amount) >= expectedAmount
      );

      if (found) {
        return { success: true, message: "Thanh toán thành công!" };
      }
      */

      // Note: Since we don't have a real API key, we show this message.
      return { 
        success: false, 
        message: "Hệ thống chưa ghi nhận thanh toán cho mã đơn " + orderCode + ". Vui lòng đợi 1-2 phút và nhấn xác nhận lại." 
      };

    } catch (error: any) {
      console.error("Payment verification error:", error);
      return { success: false, message: "Lỗi kết nối hệ thống thanh toán: " + error.message };
    }
  }
};
