# Спільні типи даних (Enum) для бази та фронтенду (Currency, Period, TypeOfCashFlow).
import enum

class Currency(str, enum.Enum):
    UAH = "UAH"
    USD = "USD"
    EUR = "EUR"

class FinancialPeriod(str, enum.Enum):
    month = "month"
    quarter = "quarter"
    year = "year"

class TypeOfCashFlow(str, enum.Enum):
    income = "income"
    expense = "expense"