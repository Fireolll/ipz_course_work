// src/api.ts

// 1. Додали обов'язковий http://
const API_BASE_URL = "http://localhost:8000";

// Отримання збереженого JWT токена
function getAuthToken(): string | null {
  const token = localStorage.getItem("access_token");
  return token ? token : null; 
}

// Універсальна обгортка для JSON запитів (для всього, крім логіну)
async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: any
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid: clear it and force a reload to trigger logout
      localStorage.removeItem("access_token");
      localStorage.removeItem("ft_user");
      window.location.reload();
    }
    const errorData = await response.json().catch(() => ({}));
    console.error("API ERROR:", response.status, errorData);
    throw new Error(errorData.detail || `Помилка: ${response.status}`);
  }

  return response.json();
}

// Окремий запит спеціально для логіну (FastAPI OAuth2 вимагає FormData)
async function loginRequest(credentials: { email: string; password: string }) {
  const formData = new URLSearchParams();
  formData.append("username", credentials.email); // FastAPI очікує поле 'username'
  formData.append("password", credentials.password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Невірний логін або пароль");
  }

  return response.json();
}

// Усі твої ендпоінти БЕЗ префікса /api/
export const api = {
  // Авторизація
  login: loginRequest,
  register: (data: any) => apiRequest("/auth/register", "POST", data),
  getMe: () => apiRequest("/users/me"),
  forgotPassword: (email: string) => apiRequest("/auth/forgot-password", "POST", { email }),
  resetPassword: (token: string, new_password: string) => apiRequest("/auth/reset-password", "POST", { token, new_password }),

  // Рахунки
  getAccounts: () => apiRequest("/accounts/"),
  createAccount: (account: any) => apiRequest("/accounts/", "POST", account),
  updateAccountStatus: (faId: number, data: { is_active: boolean }) => apiRequest(`/accounts/${faId}`, "PATCH", data),
  updateAccountBalance: (faId: number, data: { balance: number }) => apiRequest(`/accounts/${faId}/balance`, "PATCH", data),

  // Категорії
  getCategories: () => apiRequest("/categories/"),
  createCategory: (category: any) => apiRequest("/categories/", "POST", category),
  deleteCategory: (categoryId: number) => apiRequest(`/categories/${categoryId}`, "DELETE"),

  // Транзакції
  getTransactions: () => apiRequest("/transactions/"),
  createTransaction: (tx: any) => apiRequest("/transactions/", "POST", tx),
  deleteTransaction: (txId: number) => apiRequest(`/transactions/${txId}`, "DELETE"),
};