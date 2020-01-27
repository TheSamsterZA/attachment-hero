export interface AhDiagnostics {
  host?: Office.HostType;
  platform?: Office.PlatformType;
  browser?: {
    name?: string;
    version?: string;
    engine: {
      name?: string;
      version?: string;
    }
  },
  os?: {
    name?: string;
    version?: string;
    versionName?: string;
  }
}
