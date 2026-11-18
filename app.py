import sqlite3
from contextlib import closing
from datetime import datetime
from pathlib import Path

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Database berada di folder utama proyek.
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "responses.db"


def init_db():
    """Membuat tabel jawaban jika belum tersedia."""
    with closing(sqlite3.connect(DB_PATH)) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                answer TEXT NOT NULL CHECK (answer IN ('YA', 'TIDAK')),
                created_at TEXT NOT NULL
            )
        """)
        conn.commit()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/response", methods=["POST"])
def save_response():
    """Menerima dan menyimpan jawaban dari Scene 7."""
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

    except sqlite3.Error:
        app.logger.exception("Gagal menyimpan jawaban.")
        return jsonify({
            "success": False,
            "message": "Jawaban belum berhasil disimpan."
        }), 500


# Buat database dan tabel saat aplikasi dimulai.
init_db()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )