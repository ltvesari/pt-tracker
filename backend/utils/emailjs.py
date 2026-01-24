import httpx
import os
from typing import Dict, Any

# EmailJS Configuration
EMAILJS_SERVICE_ID = "service_x2qla28"
EMAILJS_TEMPLATE_ID = "template_jza6jiu"
EMAILJS_PUBLIC_KEY = "FThhlELIJPFP38k42"
EMAILJS_PRIVATE_KEY = "Q136bb9r_0YLvvT60-vcA" # Provided by user

async def send_email_via_api(template_params: Dict[str, Any]):
    """
    Sends email using EmailJS REST API.
    Bypasses SMTP port blocking by using standard HTTP POST.
    """
    url = "https://api.emailjs.com/api/v1.0/email/send"
    
    payload = {
        "service_id": EMAILJS_SERVICE_ID,
        "template_id": EMAILJS_TEMPLATE_ID,
        "user_id": EMAILJS_PUBLIC_KEY,
        "accessToken": EMAILJS_PRIVATE_KEY,
        "template_params": template_params
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=10.0)
            if response.status_code == 200:
                print("EmailJS API: Email sent successfully.")
                return {"message": "Email sent successfully"}
            else:
                print(f"EmailJS API Error: {response.text}")
                return {"error": f"EmailJS Error: {response.text}"}
        except Exception as e:
            print(f"EmailJS Connection Error: {e}")
            return {"error": str(e)}
