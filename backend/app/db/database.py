"""
TravelMate AI - SQLite Persistent Database Engine
Handles local relational persistence for users, expenses, hidden places, and community.
"""

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "travelmate.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        preferred_language TEXT DEFAULT 'en',
        travel_style TEXT DEFAULT 'Budget',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Expenses Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT DEFAULT 'demo_user',
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # User-Submitted Hidden Places Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_hidden_places (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        category TEXT DEFAULT 'hidden_gem',
        short_desc TEXT NOT NULL,
        photo_url TEXT,
        rating REAL DEFAULT 5.0,
        submitted_by TEXT DEFAULT 'Local Explorer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Community Posts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS community_posts (
        id TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        avatar TEXT,
        location_name TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT DEFAULT '[]',
        rating INTEGER DEFAULT 5,
        likes INTEGER DEFAULT 0,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Pre-populate sample user if not exists
    cursor.execute("SELECT id FROM users WHERE email = 'tourist@travelmate.ai'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO users (id, full_name, email, password_hash, preferred_language, travel_style)
        VALUES ('usr_demo', 'Jayasree Tourist', 'tourist@travelmate.ai', 'demo123', 'en', 'Budget')
        """)

    # Pre-populate initial expenses if table is empty
    cursor.execute("SELECT COUNT(*) as cnt FROM expenses")
    if cursor.fetchone()["cnt"] == 0:
        sample_expenses = [
            ("Hyderabad Metro Day Pass", "transit", 100.0),
            ("Charminar Monument Entry Ticket", "entry", 25.0),
            ("Nimrah Cafe Irani Chai & Biscuits", "food", 45.0),
            ("Hotel Shadab Mutton Biryani", "food", 280.0)
        ]
        cursor.executemany("""
        INSERT INTO expenses (title, category, amount) VALUES (?, ?, ?)
        """, sample_expenses)

    conn.commit()
    conn.close()
    print("[Database] SQLite database initialized successfully at:", DB_PATH)

if __name__ == "__main__":
    init_db()
