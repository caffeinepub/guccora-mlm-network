export function formatCurrency(amount: bigint | number): string {
  const num = typeof amount === "bigint" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(timestamp: bigint | number): string {
  const ms =
    typeof timestamp === "bigint" ? Number(timestamp) / 1_000_000 : timestamp;
  const d = new Date(ms);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getToken(): string | null {
  return localStorage.getItem("guccora_token");
}

export function setToken(token: string): void {
  localStorage.setItem("guccora_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("guccora_token");
}

export function getAdminToken(): string | null {
  return localStorage.getItem("guccora_admin_token");
}

export function setAdminToken(token: string): void {
  localStorage.setItem("guccora_admin_token", token);
}

export function clearAdminToken(): void {
  localStorage.removeItem("guccora_admin_token");
}
