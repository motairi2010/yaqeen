# -*- coding: utf-8 -*-
"""
currency_system.py
نظام مرن لتنسيق العملات مع دعم العربية/الإنجليزية ورمز SAR (﷼) بمكان صحيح.
- يعمل بلا تبعيات. إن وُجد Babel يُستخدم تلقائياً لتحسين النتائج.
- يدعم parsing مدخلات بأرقام عربية ٠١٢٣... وفواصل عربية.
"""

from __future__ import annotations
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation

try:
    from babel.numbers import format_currency as _babel_fmt_curr, format_decimal as _babel_fmt_dec
    HAVE_BABEL = True
except Exception:
    HAVE_BABEL = False

# -------- إعدادات عامة --------

NBSP = "\u00A0"        # مسافة غير قابلة للكسر
NNBSP = "\u202F"       # مسافة نحيفة غير قابلة للكسر (اختياري)
MINUS = "-"            # أو "\u2212" إن تبغى ناقص طباعي
SAR_SYM = "\uFDFC"     # ﷼ (قد يتطلب خط يدعمه)
AR_DEC = "\u066B"      # ٫
AR_THO = "\u066C"      # ٬
AR_DIGITS = "٠١٢٣٤٥٦٧٨٩"
EN_DIGITS = "0123456789"

CURRENCY_TABLE = {
    # بإمكانك توسعتها لاحقاً
    "SAR": {
        "symbol": SAR_SYM,
        "fallback": "SAR",             # لو الخط ما يدعم ﷼
        "positions": {"ar": "suffix", "en": "prefix"},
    },
    "USD": {"symbol": "$", "fallback": "USD", "positions": {"ar": "suffix", "en": "prefix"}},
    "EUR": {"symbol": "€", "fallback": "EUR", "positions": {"ar": "suffix", "en": "prefix"}},
}

# -------- أدوات مساعدة --------

def _to_decimal(value) -> Decimal:
    """يحوّل أي قيمة رقمية أو نص (حتى لو بأرقام عربية) إلى Decimal."""
    if value is None:
        return Decimal("0")
    s = str(value).strip()

    # حوّل الأرقام العربية إلى لاتينية
    trans = {ord(a): str(i) for i, a in enumerate(AR_DIGITS)}
    s = s.translate(trans)

    # وحّد الفواصل
    s = s.replace(AR_DEC, ".")
    for sep in (AR_THO, ",", NBSP, " "):
        s = s.replace(sep, "")

    s = s.replace("\u2212", "-")  # minus sign إلى ASCII
    try:
        return Decimal(s)
    except InvalidOperation:
        return Decimal("0")


def _group_triplets(int_part: str, sep: str = ",") -> str:
    """يفصل الآلاف كل 3 من اليمين."""
    if len(int_part) <= 3:
        return int_part
    out = []
    while int_part:
        out.append(int_part[-3:])
        int_part = int_part[:-3]
    return sep.join(reversed(out))


def _latin_to_ar_digits(s: str) -> str:
    trans = {ord(d): AR_DIGITS[i] for i, d in enumerate(EN_DIGITS)}
    return s.translate(trans)


def _format_number_local(
    value: Decimal,
    lang: str = "ar",
    digits: int = 2,
    grouping: bool = True,
    arabic_digits_for_ar: bool = True,
) -> str:
    """
    تنسيق رقمي داخلي بدون Babel:
    - ar: أرقام عربية، فاصل عشري ٫، فاصل آلاف ٬
    - en: أرقام لاتينية، . و ,
    """
    q = Decimal(10) ** -digits
    v = value.quantize(q, rounding=ROUND_HALF_UP)

    neg = v < 0
    v = -v if neg else v

    # جزء صحيح وعشري
    t = f"{v:.{digits}f}"
    int_part, frac_part = t.split(".")

    if grouping:
        if lang == "ar":
            int_part = _group_triplets(int_part, AR_THO)
        else:
            int_part = _group_triplets(int_part, ",")

    if lang == "ar":
        dec = AR_DEC
        num = int_part + (dec + frac_part if digits else "")
        if arabic_digits_for_ar:
            num = _latin_to_ar_digits(num)
    else:
        dec = "."
        num = int_part + (dec + frac_part if digits else "")

    return (MINUS + num) if neg else num


def _pick_symbol(currency: str, prefer_fallback: bool = False) -> str:
    meta = CURRENCY_TABLE.get(currency.upper(), None)
    if not meta:
        return currency.upper()
    if prefer_fallback:
        return meta["fallback"]
    return meta["symbol"] or meta["fallback"]


def _pick_position(currency: str, lang: str, default: str = "prefix") -> str:
    meta = CURRENCY_TABLE.get(currency.upper())
    if not meta:
        return default
    return meta.get("positions", {}).get(lang, default)


# -------- API رئيسية --------

def format_currency(
    amount,
    currency_code: str = "SAR",
    language: str = "ar",
    digits: int = 2,
    use_nbsp: bool = True,
    prefer_ascii_symbol: bool = False,  # True لو شكّك بخط لا يدعم ﷼
    use_babel_if_available: bool = True,
) -> str:
    """
    تنسيق عملة مرن:
      - يختار موضع الرمز تلقائياً حسب اللغة (ar suffix / en prefix لسعودي)
      - يدعم أرقام عربية في العربية
      - NBSP لمنع الكسر بين الرمز والرقم
      - مع Babel: نستفيد منه ثم نُبدّل جزء العملة إلى الرمز المطلوب
    """
    lang = "ar" if language.lower().startswith("ar") else "en"
    currency = currency_code.upper()
    space = NBSP if use_nbsp else " "

    sym = _pick_symbol(currency, prefer_ascii_symbol)
    pos = _pick_position(currency, lang, default=("suffix" if lang == "ar" else "prefix"))

    dec = _to_decimal(amount)

    # مسار Babel إن توفّر
    if HAVE_BABEL and use_babel_if_available:
        loc = "ar" if lang == "ar" else "en"
        try:
            s = _babel_fmt_curr(
                dec,
                currency=currency,
                locale=loc,
                format=None,  # دع Babel يختار pattern المحلي
                decimal_quantization=True,
                currency_digits=False,  # نتحكم بالدقة نحن
            )
            # قص للأرقام حسب digits إن لزم
            if digits is not None:
                s_num = _babel_fmt_dec(dec, locale=loc, format=f"#{','##0}.{digits * '0'}")
            else:
                s_num = _babel_fmt_dec(dec, locale=loc)

            # استبدل جزء العملة إلى الرمز الذي نريده + NBSP
            # لاحظ: Babel قد يضع "ر.س" أو "SAR" أو "$"
            # نحن نُركّب يدوياً من الرقم + الرمز
            return (f"{s_num}{space}{sym}") if pos == "suffix" else (f"{sym}{space}{s_num}")
        except Exception:
            # سقوط لخطة B
            pass

    # مسار داخلي بلا Babel
    s_num = _format_number_local(dec, lang=lang, digits=digits, grouping=True)
    return (f"{s_num}{space}{sym}") if pos == "suffix" else (f"{sym}{space}{s_num}")


# -------- نظام إدارة العملات (بسيط وقابل للتوسعة) --------

def register_currency(
    code: str,
    symbol: str,
    fallback: str | None = None,
    positions: dict | None = None,
):
    """
    أضف/حدّث عملة:
      register_currency("AED", "د.إ", fallback="AED", positions={"ar":"suffix","en":"prefix"})
    """
    code = code.upper()
    CURRENCY_TABLE[code] = {
        "symbol": symbol,
        "fallback": fallback or code,
        "positions": positions or {"ar": "suffix", "en": "prefix"},
    }


def set_currency_position(code: str, lang: str, position: str):
    code = code.upper()
    if code not in CURRENCY_TABLE:
        CURRENCY_TABLE[code] = {"symbol": code, "fallback": code, "positions": {}}
    CURRENCY_TABLE[code].setdefault("positions", {})[lang] = position


# -------- اختبارات سريعة يدوية --------

if __name__ == "__main__":
    samples = [0, 1, 12.5, 1234.5, -9876543.21, "١٢٣٤٫٥٠", "12,345.9"]
    for x in samples:
        print("AR:", format_currency(x, "SAR", "ar"))
        print("EN:", format_currency(x, "SAR", "en"))
        print("---")
