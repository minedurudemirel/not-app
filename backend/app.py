from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import datetime
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)


# JWT secret key (bunu daha güvenli bir şekilde saklamak lazım)
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  
jwt = JWTManager(app)

@app.route('/')
def home():
    return "Backend çalışıyor!"

DATABASE = 'users.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    # notes tablosu
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            created_at TIMESTAMP NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()



@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Kullanıcı adı ve şifre zorunlu'}), 400

    hashed_pw = hash_password(password)
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, hashed_pw))
        conn.commit()
        
        # Yeni kullanıcı id'sini al
        user_id = cursor.lastrowid
        access_token = create_access_token(identity=str(user_id))
        return jsonify({'access_token': access_token}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Bu kullanıcı adı zaten alınmış'}), 409
    finally:
        if conn:
            conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Kullanıcı adı ve şifre zorunlu'}), 400

    hashed_pw = hash_password(password)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, hashed_pw))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        user_id_str = str(user['id'])  # ID'yi string'e çevir
        print("user_id_str type:", type(user_id_str), "value:", user_id_str)  # debug için
        access_token = create_access_token(identity=user_id_str)  # sadece string gönderiyoruz
        return jsonify({'access_token': access_token})
    else:
        return jsonify({'error': 'Kullanıcı adı veya şifre yanlış'}), 401
 

# Not ekleme (JWT korumalı)
@app.route('/api/notes', methods=['POST'])
@jwt_required()
def add_note():
    user_id = get_jwt_identity()
    print("JWT identity type:", type(user_id), "value:", user_id)  # debug için
    data = request.get_json()
    title = data.get('title')
    content = data.get('content', '')
    if not title:
        return jsonify({'error': 'title zorunlu'}), 400
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.datetime.now()
    cursor.execute('INSERT INTO notes (user_id, title, content, created_at) VALUES (?, ?, ?, ?)',
                   (user_id, title, content, now))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Not eklendi'}), 201

# Notları listeleme (JWT korumalı)
@app.route('/api/notes', methods=['GET'])
@jwt_required()
def get_notes():
    user_id = get_jwt_identity()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM notes WHERE user_id = ?', (user_id,))
    notes = cursor.fetchall()
    conn.close()
    notes_list = [dict(note) for note in notes]
    return jsonify(notes_list)

# Not güncelleme (JWT korumalı)
@app.route('/api/notes/<int:note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get('title')
    content = data.get('content', '')
    conn = get_db()
    cursor = conn.cursor()
    # Sadece o not user_id'ye aitse güncellenmeli, değilse hata döner
    cursor.execute('SELECT * FROM notes WHERE id = ? AND user_id = ?', (note_id, user_id))
    note = cursor.fetchone()
    if not note:
        return jsonify({'error': 'Not bulunamadı veya yetkisiz'}), 404
    cursor.execute('UPDATE notes SET title = ?, content = ? WHERE id = ?', (title, content, note_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Not güncellendi'})

# Not silme (JWT korumalı)
@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    user_id = get_jwt_identity()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM notes WHERE id = ? AND user_id = ?', (note_id, user_id))
    note = cursor.fetchone()
    if not note:
        return jsonify({'error': 'Not bulunamadı veya yetkisiz'}), 404
    cursor.execute('DELETE FROM notes WHERE id = ?', (note_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Not silindi'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host="0.0.0.0")

