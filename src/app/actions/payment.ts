"use server";

export async function verifyPaymentAction(orderCode: string, expectedAmount: number) {
  try {
    // API keys are safe on the server
    const API_KEY = process.env.NEXT_PUBLIC_SEPAY_API_KEY;
    const ACCOUNT_NUMBER = "1730052005"; 

    if (!API_KEY) {
      return { 
        success: false, 
        message: "Hệ thống chưa cấu hình API Key cho SePay." 
      };
    }

    // Server-side fetch avoids CORS issues
    const response = await fetch(`https://my.sepay.vn/userapi/transactions/list?account_number=${ACCOUNT_NUMBER}&limit=20`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 } // Ensure no caching in Next.js
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Lỗi HTTP ${response.status} từ SePay API`);
    }
    
    const result = await response.json();
    
    // Support various response formats
    const transactions: any[] = result.items || result.transactions || (result.data ? result.data.transactions : []) || [];

    if (!Array.isArray(transactions)) {
      console.error("Unexpected SePay response format:", result);
      return { success: false, message: "Lỗi định dạng phản hồi từ hệ thống thanh toán." };
    }

    // Look for the order code in content and check amount
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
    console.error("Server Payment check error:", error);
    return { success: false, message: "Lỗi kết nối hệ thống thanh toán: " + error.message };
  }
}
