from typing import List, Dict
from app.models.schemas import BudgetCalcRequest, BudgetAlertResponse

class BudgetService:
    def calculate_budget(self, req: BudgetCalcRequest) -> BudgetAlertResponse:
        total_spent = (
            req.transport_cost +
            req.entry_fees +
            req.food_cost +
            req.stay_cost +
            req.shopping_cost
        )
        remaining = req.total_budget - total_spent
        percentage = (total_spent / req.total_budget) * 100.0 if req.total_budget > 0 else 100.0

        if percentage >= 100.0:
            alert_level = "DANGER"
            alert_message = f"Budget Exceeded! You have spent ₹{total_spent:.0f} (₹{abs(remaining):.0f} over your ₹{req.total_budget:.0f} budget)."
        elif percentage >= 80.0:
            alert_level = "WARNING"
            alert_message = f"Budget Alert: You have used {percentage:.1f}% of your allocated budget. ₹{remaining:.0f} remaining."
        else:
            alert_level = "SAFE"
            alert_message = f"Your travel spending is on track! Remaining budget: ₹{remaining:.0f} ({100 - percentage:.1f}% left)."

        cheaper_alternatives = self.get_cheaper_alternatives(req)

        return BudgetAlertResponse(
            total_budget=round(req.total_budget, 2),
            total_spent=round(total_spent, 2),
            remaining=round(remaining, 2),
            percentage_spent=round(percentage, 1),
            alert_level=alert_level,
            alert_message=alert_message,
            cheaper_alternatives=cheaper_alternatives
        )

    def get_cheaper_alternatives(self, req: BudgetCalcRequest) -> List[str]:
        alternatives = []
        if req.transport_cost > 300:
            alternatives.append("Switch from app cabs to the Hyderabad Metro Rail (Max fare ₹60) or TSRTC bus day pass (₹100) to save up to 70% on transit.")
        if req.food_cost > 500:
            alternatives.append("Try authentic historic cafes like Cafe Niloufer or Nimrah Cafe for hearty breakfasts and snacks under ₹80.")
        if req.stay_cost > 1500:
            alternatives.append("Look for verified backpacker hostels or guest houses in Lakdikapul or Begumpet starting from ₹600/night.")
        
        alternatives.append("Explore zero-entry-fee attractions: Paigah Tombs, Moula Ali Hilltop, Khajaguda Rocks, and Birla Mandir.")
        return alternatives

budget_service = BudgetService()
