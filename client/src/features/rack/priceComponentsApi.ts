import api from "@/features/auth/authApi";

export interface SupportComponent {
  code: string;
  name: string;
}

export interface SpanComponent {
  code: string;
  name: string;
}

export interface VerticalSupportComponent {
  code: string;
  name: string;
}

export interface ComponentsResponse {
  components: {
    supports: SupportComponent[];
    spans: SpanComponent[];
    verticalSupports: VerticalSupportComponent[];
  };
  updatedAt: string;
}

export const priceComponentsApi = {
  /**
   * Отримати список комплектуючих з прайсу
   */
  getAll: async () => {
    const { data } = await api.get("/price/components");
    return data as ComponentsResponse;
  },
};

export default priceComponentsApi;
