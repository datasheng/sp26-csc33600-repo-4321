from decimal import Decimal, ROUND_HALF_UP

PLATFORM_COMMISSION_RATE = Decimal("0.15")
BOOKING_FEE = Decimal("3.00")


def calculate_payment(hourly_rate: Decimal, hours: int) -> dict:
    rate = Decimal(str(hourly_rate))
    subtotal = (rate * hours).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    commission = (subtotal * PLATFORM_COMMISSION_RATE).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    total = subtotal + commission + BOOKING_FEE
    return {
        "subtotal": subtotal,
        "platform_commission": commission,
        "booking_fee": BOOKING_FEE,
        "total_amount": total,
    }
