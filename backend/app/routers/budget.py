from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.models.schemas import BudgetCalcRequest, BudgetAlertResponse
from app.services.budget_service import budget_service
from app.db.database import get_db_connection

router = APIRouter(prefix="/api/budget", tags=["Smart Budget Calculator"])

class AddExpenseItemRequest(BaseModel):
    title: str
    category: str
    amount: float
    user_id: Optional[str] = "demo_user"

@router.post("/calculate", response_model=BudgetAlertResponse)
def calculate_expenses_and_alerts(req: BudgetCalcRequest):
    """
    Calculate total travel expenditure, compute remaining budget,
    and trigger proactive alerts with cheaper alternatives when budget limits approach.
    """
    return budget_service.calculate_budget(req)

@router.get("/items")
def get_expense_items(user_id: str = "demo_user"):
    """Fetch persistent logged expenses from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, title, category, amount, created_at
    FROM expenses WHERE user_id = ? ORDER BY id DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    items = [dict(r) for r in rows]
    total_spent = sum(item["amount"] for item in items)
    return {
        "items": items,
        "total_spent": round(total_spent, 2),
        "count": len(items)
    }

@router.post("/items")
def add_expense_item(req: AddExpenseItemRequest):
    """Log an actual travel expense item to the database."""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive.")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO expenses (user_id, title, category, amount)
    VALUES (?, ?, ?, ?)
    """, (req.user_id, req.title, req.category, req.amount))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return {
        "status": "success",
        "message": "Expense added successfully",
        "item": {
            "id": new_id,
            "title": req.title,
            "category": req.category,
            "amount": req.amount
        }
    }

@router.delete("/items/{item_id}")
def delete_expense_item(item_id: int):
    """Delete an expense item from the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM expenses WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Expense item deleted"}
