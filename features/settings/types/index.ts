export type UserSettings = {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "enterprise";
  theme: string;
  created_at: string;
  updated_at: string;
};

export type UpdateSettingsData = {
  name?: string;
  plan?: "free" | "pro" | "enterprise";
  theme?: string;
};
