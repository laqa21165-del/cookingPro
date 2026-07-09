export interface IAppOption {
  globalData: {
    apiBaseUrl: string;
    token: string;
    user: Record<string, unknown> | null;
  };
}
