import os
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


def init_db():
    """Membuat tabel di Neon atau SQLite sesuai konfigurasi."""

    if use_postgres():
        database_url = os.environ["DATABASE_URL"]

        with psycopg.connect(
            database_url,
            connect_timeout=10
        ) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS responses (
                    id BIGSERIAL PRIMARY KEY,
                    answer VARCHAR(10) NOT NULL
                        CHECK (answer IN ('YA', 'TIDAK')),
                    created_at TEXT NOT NULL
                )
            """)

    else:
        with closing(sqlite3.connect(DB_PATH)) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS responses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    answer TEXT NOT NULL
                        CHECK (answer IN ('YA', 'TIDAK')),
                    created_at TEXT NOT NULL
                )
            """)
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

    try:
        if use_postgres():
            database_url = os.environ["DATABASE_URL"]

            with psycopg.connect(
                database_url,
                connect_timeout=10
            ) as conn:
                row = conn.execute(
                    """
                    INSERT INTO responses (answer, created_at)
                    VALUES (%s, %s)
                    RETURNING id
                    """,
                    (answer, created_at)
                ).fetchone()

                response_id = row[0]

        else:
            with closing(sqlite3.connect(DB_PATH, timeout=10)) as conn:
                cursor = conn.execute(
                    """
                    INSERT INTO responses (answer, created_at)
                    VALUES (?, ?)
                    """,
                    (answer, created_at)
                )
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
            with closing(sqlite3.connect(DB_PATH, timeout=10)) as conn:
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


# Membuat tabel otomatis ketika aplikasi dimulai.
init_db()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )