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
      const API_KEY = process.env.NEXT_PUBLIC_SEPAY_API_KEY;
      const ACCOUNT_NUMBER = "9383198407"; 

      if (!API_KEY) {
        return { 
          success: false, 
          message: "Hệ thống chưa cấu hình API Key cho SePay. Vui lòng thêm NEXT_PUBLIC_SEPAY_API_KEY vào tệp .env." 
        };
      }

      // Fetch from SePay
      // End point: https://my.sepay.vn/userapi/transactions/list
      const response = await fetch(`https://my.sepay.vn/userapi/transactions/list?account_number=${ACCOUNT_NUMBER}&limit=20`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store' // Ensure we get fresh data
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Lỗi HTTP ${response.status} từ SePay API`);
      }
      
      const result = await response.json();
      
      // SePay may return transactions directly or inside a data object
      const transactions: any[] = result.items || result.transactions || (result.data ? result.data.transactions : []) || [];

      if (!Array.isArray(transactions)) {
        console.error("Unexpected SePay response format:", result);
        return { success: false, message: "Lỗi định dạng phản hồi từ hệ thống thanh toán." };
      }

      // Look for the order code in descriptions
      // SePay usually returns 'content' for the transfer description
      const found = transactions.find(t => {
        const content = (t.content || t.transaction_content || t.description || "").toString().toUpperCase();
        const amount = parseFloat(t.amount_in || t.amount || "0");
        
        return content.includes(orderCode.toUpperCase()) && amount >= expectedAmount;
      });

      if (found) {
        return { success: true, message: "Thanh toán thành công!" };
      }

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
