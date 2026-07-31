export type ScanStatus = 'safe' | 'suspicious' | 'malicious';

export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface ApiKey {
  id: number;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at?: string;
  raw_key?: string;
}

export interface SecurityModules {
  url_validation: {
    is_valid: boolean;
    is_https: boolean;
    is_ip: boolean;
    has_punycode: boolean;
    subdomain_count: number;
    typosquatting_detected: boolean;
    target_brand_mimicked?: string;
    flags: string[];
    status: string;
    score_impact: number;
    hostname: string;
    url_length: number;
  };
  dns: {
    records: {
      A: string[];
      AAAA: string[];
      MX: string[];
      TXT: string[];
      NS: string[];
      CNAME: string[];
    };
    flags: string[];
    has_a_record: boolean;
    has_mx_record: boolean;
    has_spf: boolean;
  };
  whois: {
    domain_age_days?: number;
    registrar: string;
    creation_date?: string;
    expiration_date?: string;
    owner: string;
    flags: string[];
  };
  ssl: {
    valid: boolean;
    issuer: string;
    expiry_date?: string;
    days_until_expiry?: number;
    tls_version: string;
    cipher_suite: string;
    is_self_signed: boolean;
    flags: string[];
  };
  hosting: {
    ip_address: string;
    country: string;
    country_code: string;
    city: string;
    isp: string;
    asn: string;
    latitude: number;
    longitude: number;
    flags: string[];
  };
  redirects: {
    redirect_chain: { hop: number; url: string; status_code: number }[];
    hop_count: number;
    final_destination: string;
    has_infinite_loop: boolean;
    cross_domain_count: number;
    flags: string[];
  };
  html_security: {
    findings: {
      hidden_iframes: number;
      password_forms: number;
      js_redirects: boolean;
      obfuscated_js: boolean;
      base64_scripts: number;
      inline_event_handlers: number;
      crypto_miners: boolean;
    };
    flags: string[];
  };
  security_headers: {
    header_grades: Record<string, string>;
    grade: string;
    missing_count: number;
    flags: string[];
  };
  threat_intelligence: {
    providers: Record<string, string>;
    flagged_count: number;
    status: string;
    flags: string[];
  };
  ai_risk_engine: {
    final_score: number;
    status: ScanStatus;
    explanation: string;
    deductions: { factor: string; points: number; reason: string }[];
    bonuses: { factor: string; points: number; reason: string }[];
    breakdown: {
      base_score: number;
      total_deductions: number;
      total_bonuses: number;
    };
  };
}

export interface ScanReport {
  id: number;
  url: string;
  domain: string;
  risk_score: number;
  status: ScanStatus;
  summary?: string;
  is_saved: boolean;
  created_at: string;
  report_data?: {
    execution_time_seconds: number;
    modules: SecurityModules;
  };
}

export interface GlobalStats {
  total_scans: number;
  threats_detected: number;
  avg_scan_time: number;
  safe_urls: number;
  suspicious_urls: number;
  malicious_urls: number;
}
