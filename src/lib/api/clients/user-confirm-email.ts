import { apiClient } from "@/lib/api/client-api";
import { Customer } from "@/lib/api/types/user";

export class UserApi {
  async confirmNewEmail(email: string, code: string): Promise<{ success: boolean; error?: string; customer?: Customer }> {
   
    try {
      const result = await apiClient.post<{ customer: Customer }, { email: string; code: string }>(
        "/customer/confirm-new-email",
        { email, code }
      );
      return { success: true, customer: result.customer };
    } catch (error: any) {
      return { success: false, error: error.message || "Verification failed" };
    }
  }
}
