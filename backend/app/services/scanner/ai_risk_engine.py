from typing import Dict, Any, List

def calculate_ai_risk(
    url_res: Dict[str, Any],
    dns_res: Dict[str, Any],
    whois_res: Dict[str, Any],
    ssl_res: Dict[str, Any],
    hosting_res: Dict[str, Any],
    redirect_res: Dict[str, Any],
    html_res: Dict[str, Any],
    headers_res: Dict[str, Any],
    threat_res: Dict[str, Any],
    category_res: Dict[str, Any] = None
) -> Dict[str, Any]:
    base_score = 100
    deductions: List[Dict[str, Any]] = []
    bonuses: List[Dict[str, Any]] = []

    # 1. URL Validation
    if not url_res.get("is_https"):
        deductions.append({"factor": "Insecure Protocol", "points": 15, "reason": "No HTTPS encryption present"})
    else:
        bonuses.append({"factor": "Valid HTTPS Protocol", "points": 10, "reason": "SSL/TLS connection enabled"})

    if url_res.get("typosquatting_detected"):
        target = url_res.get("target_brand_mimicked")
        deductions.append({"factor": "Brand Mimicry / Typosquatting", "points": 35, "reason": f"Mimics official domain for '{target}'"})

    if url_res.get("is_ip"):
        deductions.append({"factor": "IP Address URL", "points": 25, "reason": "Uses raw IP address instead of registered domain"})

    if url_res.get("has_punycode"):
        deductions.append({"factor": "Homograph Attack Vector", "points": 30, "reason": "Contains Unicode/Punycode homograph characters"})

    # 2. DNS
    if not dns_res.get("has_a_record"):
        deductions.append({"factor": "Unresolved DNS", "points": 20, "reason": "No active A/AAAA DNS records"})

    # 3. WHOIS
    domain_age = whois_res.get("domain_age_days")
    if domain_age is not None:
        if domain_age < 30:
            deductions.append({"factor": "Newly Registered Domain", "points": 30, "reason": f"Domain registered only {domain_age} days ago"})
        elif domain_age > 1825:
            bonuses.append({"factor": "Established Domain", "points": 20, "reason": f"Domain is over 5 years old ({domain_age // 365} years)"})

    # 4. SSL Inspection
    if ssl_res.get("valid"):
        bonuses.append({"factor": "Valid SSL Certificate", "points": 10, "reason": f"Issued by {ssl_res.get('issuer')}"})
    else:
        if ssl_res.get("is_self_signed"):
            deductions.append({"factor": "Self-Signed SSL", "points": 25, "reason": "Certificate is self-signed and untrusted"})
        else:
            deductions.append({"factor": "Invalid / Expired SSL", "points": 25, "reason": "SSL certificate failed validation or is expired"})

    # 5. Redirects
    if redirect_res.get("has_infinite_loop"):
        deductions.append({"factor": "Infinite Redirect Loop", "points": 25, "reason": "Redirect chain loops continuously"})
    elif redirect_res.get("cross_domain_count", 0) > 1:
        deductions.append({"factor": "Multiple Cross-Domain Redirects", "points": 15, "reason": "Passes through multiple external domains"})

    # 6. HTML Security
    findings = html_res.get("findings", {})
    if findings.get("hidden_iframes", 0) > 0:
        deductions.append({"factor": "Hidden Iframes", "points": 25, "reason": "Contains invisible iframe elements used for clickjacking"})
    if findings.get("crypto_miners"):
        deductions.append({"factor": "Browser Crypto Miner", "points": 40, "reason": "Contains unauthorized cryptocurrency mining scripts"})
    if findings.get("obfuscated_js"):
        deductions.append({"factor": "Obfuscated JavaScript", "points": 20, "reason": "Contains heavily obfuscated client-side code"})

    # 7. Headers
    if headers_res.get("grade") in ["A", "B"]:
        bonuses.append({"factor": "Secure Security Headers", "points": 10, "reason": f"Received Security Header Grade '{headers_res.get('grade')}'"})
    else:
        deductions.append({"factor": "Weak Security Headers", "points": 10, "reason": f"Received Security Header Grade '{headers_res.get('grade')}'"})

    # 8. Threat Intel
    if threat_res.get("flagged_count", 0) > 0:
        deductions.append({"factor": "Blacklisted by Threat Feeds", "points": 50, "reason": "Flagged as malicious by VirusTotal / Google Safe Browsing / OpenPhish"})
    else:
        bonuses.append({"factor": "Threat Intelligence Clean", "points": 20, "reason": "No security blacklists flagged this domain"})

    # 9. Content Categories (Adult / Gambling / Piracy Warnings)
    if category_res:
        if category_res.get("is_adult"):
            deductions.append({"factor": "Adult Content 🔞", "points": 15, "reason": "Contains age-restricted explicit adult content"})
        if category_res.get("is_gambling"):
            deductions.append({"factor": "Online Gambling 🎲", "points": 15, "reason": "Contains real-money betting or casino games"})
        if category_res.get("is_illegal"):
            deductions.append({"factor": "Illegal / Piracy Material ⚠️", "points": 25, "reason": "Contains software cracks or unauthorized downloads"})

    # Compute Final Score
    total_deductions = sum(d["points"] for d in deductions)
    total_bonuses = sum(b["points"] for b in bonuses)
    final_score = max(0, min(100, base_score - total_deductions + total_bonuses))

    if final_score >= 80:
        status = "Safe"
    elif final_score >= 50:
        status = "Suspicious"
    else:
        status = "Malicious"

    # Plain English AI Explanation Generator
    explanation_parts = []
    explanation_parts.append(f"SafeSurf AI has evaluated this website and assigned a Security Trust Score of {final_score}/100 ({status.upper()}).")

    if category_res and category_res.get("warnings"):
        explanation_parts.append("CONTENT CATEGORY WARNING:\n" + "\n".join(category_res["warnings"]))

    if status == "Safe":
        explanation_parts.append("The domain shows strong indicators of legitimacy, including clean threat intelligence records, valid SSL encryption, and standard domain metadata.")
    elif status == "Suspicious":
        explanation_parts.append("Caution is advised when interacting with this URL. Several suspicious characteristics were identified during inspection.")
    else:
        explanation_parts.append("DANGER: High risk of phishing or malicious activity detected. Users should refrain from entering credentials or downloading files from this site.")

    if deductions:
        top_reasons = [f"- {d['factor']}: {d['reason']}" for d in deductions[:4]]
        explanation_parts.append("Key Risk Factors:\n" + "\n".join(top_reasons))

    if bonuses:
        top_bonuses = [f"- {b['factor']}: {b['reason']}" for b in bonuses[:3]]
        explanation_parts.append("Positive Trust Signals:\n" + "\n".join(top_bonuses))

    explanation_text = "\n\n".join(explanation_parts)

    return {
        "final_score": final_score,
        "status": status,
        "explanation": explanation_text,
        "deductions": deductions,
        "bonuses": bonuses,
        "breakdown": {
            "base_score": base_score,
            "total_deductions": total_deductions,
            "total_bonuses": total_bonuses
        }
    }
