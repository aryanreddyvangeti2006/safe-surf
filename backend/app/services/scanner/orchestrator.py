import asyncio
import time
import urllib.parse
from typing import Dict, Any

from app.services.scanner.url_validator import analyze_url
from app.services.scanner.dns_lookup import analyze_dns
from app.services.scanner.whois_lookup import analyze_whois
from app.services.scanner.ssl_inspector import analyze_ssl
from app.services.scanner.hosting_info import analyze_hosting
from app.services.scanner.redirect_analyzer import analyze_redirects
from app.services.scanner.html_analyzer import analyze_html
from app.services.scanner.headers_analyzer import analyze_headers
from app.services.scanner.threat_intel import analyze_threat_intel
from app.services.scanner.content_classifier import analyze_content_category
from app.services.scanner.ai_risk_engine import calculate_ai_risk

async def run_full_scan(raw_url: str) -> Dict[str, Any]:
    start_time = time.time()
    
    if not raw_url.startswith("http://") and not raw_url.startswith("https://"):
        formatted_url = "https://" + raw_url
    else:
        formatted_url = raw_url

    parsed = urllib.parse.urlparse(formatted_url)
    hostname = parsed.hostname or raw_url.split("/")[0]

    # Run non-blocking async tasks concurrently
    url_task = asyncio.to_thread(analyze_url, formatted_url)
    dns_task = asyncio.to_thread(analyze_dns, hostname)
    whois_task = asyncio.to_thread(analyze_whois, hostname)
    ssl_task = asyncio.to_thread(analyze_ssl, hostname)
    hosting_task = analyze_hosting(hostname)
    redirect_task = analyze_redirects(formatted_url)
    html_task = analyze_html(formatted_url)
    headers_task = analyze_headers(formatted_url)
    threat_task = analyze_threat_intel(hostname, formatted_url)
    category_task = asyncio.to_thread(analyze_content_category, hostname, formatted_url)

    (
        url_res,
        dns_res,
        whois_res,
        ssl_res,
        hosting_res,
        redirect_res,
        html_res,
        headers_res,
        threat_res,
        category_res
    ) = await asyncio.gather(
        url_task,
        dns_task,
        whois_task,
        ssl_task,
        hosting_task,
        redirect_task,
        html_task,
        headers_task,
        threat_task,
        category_task,
        return_exceptions=False
    )

    # Compute AI Risk & Explanation
    ai_risk_res = calculate_ai_risk(
        url_res, dns_res, whois_res, ssl_res, hosting_res,
        redirect_res, html_res, headers_res, threat_res, category_res
    )

    execution_time = round(time.time() - start_time, 2)

    return {
        "target_url": formatted_url,
        "domain": hostname,
        "execution_time_seconds": execution_time,
        "risk_score": ai_risk_res["final_score"],
        "status": ai_risk_res["status"],
        "summary": ai_risk_res["explanation"],
        "modules": {
            "url_validation": url_res,
            "dns": dns_res,
            "whois": whois_res,
            "ssl": ssl_res,
            "hosting": hosting_res,
            "redirects": redirect_res,
            "html_security": html_res,
            "security_headers": headers_res,
            "threat_intelligence": threat_res,
            "content_category": category_res,
            "ai_risk_engine": ai_risk_res
        }
    }
