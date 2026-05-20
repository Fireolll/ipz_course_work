# Спільні типи даних (Enum) для бази та фронтенду (Currency, Period, TypeOfCashFlow).from enum import Enums
import enum

class Currency(str, enum.Enum):
    UAH = "UAH"
    USD = "USD"
    EUR = "EUR"

class FinancialPeriod(str, enum.Enum):
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"

class TypeOfCashFlow(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"