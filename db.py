import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
from typing import List, Dict, Any, Tuple, Optional

load_dotenv()



def get_db_connection():
    """Return a connection to the existing ai_founder_assistant MySQL database."""
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "ai_founder_assistant"),
        autocommit=False,
    )


def register_user(username: str, email: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Register a new user in the existing MySQL `users` table.
    - Trims and lowercases the email so registration and login match reliably.
    - Stores the exact password without calling .strip() on password.
    - Commits the transaction with connection.commit() so the user is persisted in MySQL.
    """
    connection = None
    cursor = None
    clean_username = username.strip()
    clean_email = email.strip().lower()

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Check if email already exists (case-insensitive)
        cursor.execute(
            """
            SELECT user_id, username, email
            FROM users
            WHERE LOWER(TRIM(email)) = %s
            """,
            (clean_email,),
        )
        existing = cursor.fetchone()
        if existing:
            return False, "An account with this email already exists. Please login instead.", None

        # Insert user and commit transaction
        cursor.execute(
            """
            INSERT INTO users (username, email, password)
            VALUES (%s, %s, %s)
            """,
            (clean_username, clean_email, password),
        )
        new_user_id = cursor.lastrowid
        connection.commit()

        return (
            True,
            "Account created successfully! Welcome to AI Founder Assistant.",
            {
                "user_id": new_user_id,
                "username": clean_username,
                "email": clean_email,
            },
        )
    except Error as err:
        if connection:
            connection.rollback()
        return False, f"Database error during registration: {err}", None
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def authenticate_user(email: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Verify user credentials against the existing MySQL `users` table.
    - Uses email.strip().lower() and LOWER(TRIM(email)) in SQL for reliable email matching.
    - Compares the stored password using the exact same method used during registration.
    """
    connection = None
    cursor = None
    clean_email = email.strip().lower()

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT user_id, username, email, password
            FROM users
            WHERE LOWER(TRIM(email)) = %s
            """,
            (clean_email,),
        )
        user_row = cursor.fetchone()

        if not user_row:
            return False, "Invalid email or password. Please check your credentials and try again.", None

        stored_password = user_row["password"]
        if isinstance(stored_password, (bytes, bytearray)):
            stored_password = stored_password.decode("utf-8")

        # Compare password using the same plain/stored representation used during registration
        if stored_password != password:
            return False, "Invalid email or password. Please check your credentials and try again.", None

        return (
            True,
            "Login successful! Redirecting to your AI Founder Assistant Dashboard...",
            {
                "user_id": user_row["user_id"],
                "username": user_row["username"],
                "email": user_row["email"],
            },
        )
    except Error as err:
        return False, f"Database error during login: {err}", None
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def get_user_startups(user_id: int) -> List[Dict[str, Any]]:
    """Fetch all startups belonging to the logged-in user."""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                s.startup_id,
                s.user_id,
                s.startup_name,
                s.industry,
                s.execution_stage,
                s.tagline,
                s.problem_statement,
                s.proposed_solution,
                s.target_customers,
                s.business_model,
                s.estimated_investment,
                s.projected_monthly_revenue,
                s.created_at,
                s.updated_at
            FROM startups s
            WHERE s.user_id = %s
            ORDER BY s.updated_at DESC, s.startup_id DESC
            """,
            (user_id,),
        )
        return cursor.fetchall() or []
    except Error as err:
        print(f"Database error in get_user_startups: {err}")
        return []
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def get_default_competitors_for_startup(startup_name: str, industry: str) -> List[Dict[str, str]]:
    """
    Return 2 relevant default competitors based on the startup name and industry.
    For SkillBridge AI / EdTech, returns Coursera and Udemy.
    """
    combined = f"{startup_name} {industry}".lower()

    if (
        startup_name.strip().lower() == "skillbridge ai"
        or "edtech" in combined
        or "education" in combined
        or "learning" in combined
    ):
        return [
            {
                "competitor_name": "Coursera",
                "category": "EdTech / Online Learning",
                "description": "Online learning platform offering courses, professional certificates, and career-focused learning programs.",
            },
            {
                "competitor_name": "Udemy",
                "category": "EdTech / Online Learning",
                "description": "Online course marketplace covering programming, technology, business, and career skills.",
            },
        ]

    if "climatetech" in combined or "packaging" in combined or "sustainable" in combined:
        return [
            {
                "competitor_name": "EcoEnclose",
                "category": "ClimateTech / Sustainable Packaging",
                "description": "Sustainable packaging supplier offering recycled and eco-friendly mailers, boxes, and shipping supplies.",
            },
            {
                "competitor_name": "Packhelp",
                "category": "ClimateTech / Sustainable Packaging",
                "description": "Custom packaging marketplace connecting businesses with eco-friendly packaging manufacturers.",
            },
        ]

    if "fintech" in combined or "finance" in combined or "payment" in combined:
        return [
            {
                "competitor_name": "Ramp",
                "category": "FinTech / Financial Automation",
                "description": "Corporate spend management, invoice automation, and financial controls platform for businesses.",
            },
            {
                "competitor_name": "Bill.com",
                "category": "FinTech / Back-Office Finance",
                "description": "Cloud-based accounts payable, billing, and payment workflow automation platform.",
            },
        ]

    clean_industry = industry.strip() or "SaaS / Technology"
    return [
        {
            "competitor_name": f"{clean_industry.split('/')[0].strip()} Enterprise Suite",
            "category": f"{clean_industry} / Established Platform",
            "description": f"Established platform offering general-purpose tools and enterprise services in {clean_industry}.",
        },
        {
            "competitor_name": "Legacy Point Tools & Spreadsheets",
            "category": f"{clean_industry} / Status-Quo Alternative",
            "description": f"Traditional manual workflows, spreadsheets, and disconnected tools used in {clean_industry}.",
        },
    ]


def ensure_default_competitors(startup_id: int, startup_name: str, industry: str) -> None:
    """
    Insert the 2 default competitors for a startup into the MySQL `competitors` table
    only if they do not already exist for that `startup_id` (prevents duplicates on reruns).
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        defaults = get_default_competitors_for_startup(startup_name, industry)

        for comp in defaults:
            cursor.execute(
                """
                SELECT competitor_id
                FROM competitors
                WHERE startup_id = %s AND LOWER(TRIM(competitor_name)) = LOWER(TRIM(%s))
                """,
                (startup_id, comp["competitor_name"]),
            )
            exists = cursor.fetchone()

            if not exists:
                cursor.execute(
                    """
                    INSERT INTO competitors (
                        startup_id,
                        competitor_name,
                        category,
                        their_strength
                    )
                    VALUES (%s, %s, %s, %s)
                    """,
                    (
                        startup_id,
                        comp["competitor_name"],
                        comp["category"],
                        comp["description"],
                    ),
                )

        connection.commit()
    except Error as err:
        if connection:
            connection.rollback()
        print(f"Database error in ensure_default_competitors: {err}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def delete_startup(startup_id: int, user_id: int) -> Tuple[bool, str]:
    """
    Delete only the selected startup belonging to the currently logged-in user
    and its related records inside a MySQL transaction.
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        connection.start_transaction()

        cursor.execute(
            """
            SELECT startup_id, user_id
            FROM startups
            WHERE startup_id = %s AND user_id = %s
            FOR UPDATE
            """,
            (startup_id, user_id),
        )
        startup_record = cursor.fetchone()

        if not startup_record:
            connection.rollback()
            return False, "Unauthorized or startup not found."

        cursor.execute("DELETE FROM competitors WHERE startup_id = %s", (startup_id,))
        cursor.execute("DELETE FROM swot_analysis WHERE startup_id = %s", (startup_id,))
        cursor.execute("DELETE FROM tasks WHERE startup_id = %s", (startup_id,))
        cursor.execute("DELETE FROM startup_summaries WHERE startup_id = %s", (startup_id,))
        cursor.execute("DELETE FROM ai_suggestions WHERE startup_id = %s", (startup_id,))

        cursor.execute(
            """
            DELETE FROM startups
            WHERE startup_id = %s AND user_id = %s
            """,
            (startup_id, user_id),
        )

        if cursor.rowcount == 0:
            connection.rollback()
            return False, "Could not delete startup."

        connection.commit()
        return True, "Startup deleted successfully."

    except Error as err:
        if connection:
            connection.rollback()
        return False, f"Error deleting startup: {err}"
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
