import os
import re
import sqlite3
from contextlib import closing
from datetime import datetime
from pathlib import Path

import psycopg
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "responses.db"


def use_postgres():
    return bool(os.environ.get("DATABASE_URL"))


def detect_device(user_agent):
    ua = (user_agent or "").lower()

    if any(x in ua for x in ["ipad", "tablet", "kindle", "silk"]):
        return "Tablet"

    if "android" in ua and "mobile" not in ua:
        return "Tablet"

    if any(x in ua for x in ["mobile", "iphone", "ipod", "android"]):
        return "Smartphone"

    if ua:
        return "Desktop"

    return "Unknown"


def detect_browser(user_agent):
    ua = (user_agent or "").lower()

    if "edg/" in ua:
        return "Microsoft Edge"
    if "opr/" in ua or "opera" in ua:
        return "Opera"
    if "samsungbrowser" in ua:
        return "Samsung Internet"
    if "firefox/" in ua:
        return "Firefox"
    if "chrome/" in ua and "chromium" not in ua:
        return "Google Chrome"
    if "safari/" in ua:
        return "Safari"

    return "Unknown"


def detect_os(user_agent):
    ua = (user_agent or "").lower()

    if "windows" in ua:
        return "Windows"
    if "android" in ua:
        return "Android"
    if any(x in ua for x in ["iphone", "ipad", "ipod"]):
        return "iOS / iPadOS"
    if "mac os x" in ua or "macintosh" in ua:
        return "macOS"
    if "linux" in ua:
        return "Linux"

    return "Unknown"


def get_client_info():
    user_agent = request.headers.get("User-Agent", "")

    return {
        "user_agent": user_agent[:1000],
        "device_type": detect_device(user_agent),
        "browser": detect_browser(user_agent),
        "operating_system": detect_os(user_agent)
    }


def init_db():
    if use_postgres():
        database_url = os.environ["DATABASE_URL"]

        with psycopg.connect(database_url, connect_timeout=10) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS responses (
                    id BIGSERIAL PRIMARY KEY,
                    answer VARCHAR(10) NOT NULL
                        CHECK (answer IN ('YA', 'TIDAK')),
                    created_at TEXT NOT NULL,
                    user_agent TEXT,
                    device_type VARCHAR(30),
                    browser VARCHAR(50),
                    operating_system VARCHAR(50)
                )
            """)

            conn.execute("""
                ALTER TABLE responses
                ADD COLUMN IF NOT EXISTS user_agent TEXT
            """)
            conn.execute("""
                ALTER TABLE responses
                ADD COLUMN IF NOT EXISTS device_type VARCHAR(30)
            """)
            conn.execute("""
                ALTER TABLE responses
                ADD COLUMN IF NOT EXISTS browser VARCHAR(50)
            """)
            conn.execute("""
                ALTER TABLE responses
                ADD COLUMN IF NOT EXISTS operating_system VARCHAR(50)
            """)

    else:
        with closing(sqlite3.connect(DB_PATH)) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS responses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    answer TEXT NOT NULL
                        CHECK (answer IN ('YA', 'TIDAK')),
                    created_at TEXT NOT NULL,
                    user_agent TEXT,
                    device_type TEXT,
                    browser TEXT,
                    operating_system TEXT
                )
            """)

            existing = {
                row[1]
                for row in conn.execute(
                    "PRAGMA table_info(responses)"
                ).fetchall()
            }

            columns = {
                "user_agent": "TEXT",
                "device_type": "TEXT",
                "browser": "TEXT",
                "operating_system": "TEXT"
            }

            for column, column_type in columns.items():
                if column not in existing:
                    conn.execute(
                        f"ALTER TABLE responses ADD COLUMN {column} {column_type}"
                    )

            conn.commit()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/response", methods=["POST"])
def save_response():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "Data JSON tidak valid."
        }), 400

    answer = data.get("answer")

    if answer not in ("YA", "TIDAK"):
        return jsonify({
            "success": False,
            "message": "Jawaban harus YA atau TIDAK."
        }), 400

    created_at = datetime.now().astimezone().isoformat(
        timespec="seconds"
    )

    client = get_client_info()

    try:
        if use_postgres():
            database_url = os.environ["DATABASE_URL"]

            with psycopg.connect(
                database_url,
                connect_timeout=10
            ) as conn:

                row = conn.execute("""
                    INSERT INTO responses (
                        answer,
                        created_at,
                        user_agent,
                        device_type,
                        browser,
                        operating_system
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    answer,
                    created_at,
                    client["user_agent"],
                    client["device_type"],
                    client["browser"],
                    client["operating_system"]
                )).fetchone()

                response_id = row[0]

        else:
            with closing(
                sqlite3.connect(DB_PATH, timeout=10)
            ) as conn:

                cursor = conn.execute("""
                    INSERT INTO responses (
                        answer,
                        created_at,
                        user_agent,
                        device_type,
                        browser,
                        operating_system
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    answer,
                    created_at,
                    client["user_agent"],
                    client["device_type"],
                    client["browser"],
                    client["operating_system"]
                ))

                conn.commit()
                response_id = cursor.lastrowid

        return jsonify({
            "success": True,
            "message": "Jawaban berhasil disimpan.",
            "id": response_id,
            "answer": answer,
            "created_at": created_at
        }), 201

    except Exception:
        app.logger.exception("Gagal menyimpan jawaban.")

        return jsonify({
            "success": False,
            "message": "Jawaban belum berhasil disimpan."
        }), 500


@app.route("/api/health", methods=["GET"])
def health():
    try:
        if use_postgres():
            with psycopg.connect(
                os.environ["DATABASE_URL"],
                connect_timeout=10
            ) as conn:
                conn.execute("SELECT 1")

            database = "postgresql"

        else:
            with closing(sqlite3.connect(DB_PATH)) as conn:
                conn.execute("SELECT 1")

            database = "sqlite"

        return jsonify({
            "success": True,
            "database": database
        })

    except Exception:
        app.logger.exception("Database health check gagal.")

        return jsonify({
            "success": False,
            "message": "Database tidak dapat dihubungi."
        }), 503


init_db()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )