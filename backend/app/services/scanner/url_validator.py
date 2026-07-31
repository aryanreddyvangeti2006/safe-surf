import re
import urllib.parse
from typing import Dict, Any, List

TARGET_BRANDS = [
    "google", "paypal", "facebook", "apple", "microsoft", "amazon",
    "netflix", "chase", "wellsfargo", "bankofamerica", "binance", "coinbase",
    "dropbox", "github", "twitter", "instagram", "linkedin", "steam"
]

def levenshtein_distance(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def analyze_url(url: str) -> Dict[str, Any]:
    flags: List[str] = []
    status = "Safe"
    score_impact = 0

    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    parsed = urllib.parse.urlparse(url)
    hostname = parsed.hostname or ""
    scheme = parsed.scheme.lower()

    # 1. Scheme Check
    is_https = scheme == "https"
    if not is_https:
        flags.append("Insecure HTTP protocol used (missing HTTPS encryption)")
        score_impact -= 15

    # 2. IP-based URL
    ip_pattern = re.compile(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$")
    is_ip = bool(ip_pattern.match(hostname))
    if is_ip:
        flags.append("URL uses a raw IP address instead of a domain name")
        score_impact -= 25

    # 3. Homograph / Punycode
    has_punycode = hostname.startswith("xn--") or any(ord(char) > 127 for char in hostname)
    if has_punycode:
        flags.append("Homograph/Unicode attack vector detected (Punycode characters present)")
        score_impact -= 30

    # 4. Excessive Subdomains
    subdomain_parts = hostname.split(".")
    domain_body = subdomain_parts[-2] if len(subdomain_parts) >= 2 else hostname
    subdomain_count = len(subdomain_parts) - 2 if len(subdomain_parts) > 2 else 0
    if subdomain_count >= 3:
        flags.append(f"Excessive subdomains detected ({subdomain_count} levels)")
        score_impact -= 15

    # 5. Typosquatting Check
    matched_brand = None
    for brand in TARGET_BRANDS:
        if brand in domain_body:
            continue
        dist = levenshtein_distance(domain_body, brand)
        if 1 <= dist <= 2 and len(domain_body) >= 4:
            matched_brand = brand
            flags.append(f"Typosquatting detected: Domain '{domain_body}' mimics famous brand '{brand}'")
            score_impact -= 35
            break

    # 6. Suspicious Symbols
    suspicious_chars = ["@", "-", "//", "login", "verify", "secure", "banking", "update", "account"]
    matched_keywords = [kw for kw in suspicious_chars if kw in parsed.path.lower() or kw in hostname.lower()]
    if "@" in parsed.netloc:
        flags.append("URL contains user-info '@' symbol (credential harvesting indicator)")
        score_impact -= 30
    if len(matched_keywords) > 1:
        flags.append(f"Suspicious security keywords in URL: {', '.join(matched_keywords)}")
        score_impact -= 10

    # 7. URL Length
    if len(url) > 100:
        flags.append("Excessively long URL (>100 characters)")
        score_impact -= 5

    if score_impact <= -30:
        status = "Dangerous"
    elif score_impact < 0:
        status = "Suspicious"

    return {
        "is_valid": bool(hostname),
        "is_https": is_https,
        "is_ip": is_ip,
        "has_punycode": has_punycode,
        "subdomain_count": subdomain_count,
        "typosquatting_detected": bool(matched_brand),
        "target_brand_mimicked": matched_brand,
        "flags": flags,
        "status": status,
        "score_impact": score_impact,
        "hostname": hostname,
        "url_length": len(url)
    }
