from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from currency_system import format_currency

app = FastAPI(title="Currency Service", version="0.1.0")

# أثناء التطوير: افتح CORS. للإنتاج غيّر allow_origins إلى نطاقك فقط.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/format")
def format_endpoint(
    amount: str = Query(..., description="المبلغ مثل 1234.5 أو ١٢٣٤٫٥"),
    currency_code: str = "SAR",
    language: str = "ar",
    digits: int = 2,
    prefer_ascii_symbol: bool = False,
):
    out = format_currency(
        amount,
        currency_code=currency_code,
        language=language,
        digits=digits,
        use_nbsp=True,
        prefer_ascii_symbol=prefer_ascii_symbol,
        use_babel_if_available=True,
    )
    return {"formatted": out}
