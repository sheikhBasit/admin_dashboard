// API response types for audit endpoints
export interface AuditLogsResponse {
  logs: AuditLog[];
}

export interface AuditActionsSummaryResponse extends AuditActionsSummary {
  actions: AuditActionStat[];
}

export interface AuditUserActivitySummaryResponse extends AuditUserActivitySummary {
  users: AuditUserActivity[];
}
// Audit log entry
export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  action: string;
  resource: string;
  ip_address: string;
  status: "success" | "failure";
}

// Audit action statistics
export interface AuditActionStat {
  action: string;
  count: number;
  last_performed: string;
  success_rate: number;
}

// User activity for audit
export interface AuditUserActivity {
  user_id: string;
  username: string;
  total_actions: number;
  last_activity: string;
  risk_score: number;
}

// Audit actions summary (for cards)
export interface AuditActionsSummary {
  total_actions: number;
  failed_actions: number;
}

// User activity summary (for cards)
export interface AuditUserActivitySummary {
  active_users: number;
  high_risk_users: number;
}
