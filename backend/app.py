from flask import Flask, render_template, request, redirect, url_for, session
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key' #change

# MySQL configuration
app.config['MYSQL_HOST'] = 'localhost' #change
app.config['MYSQL_USER'] = 'the_username' #change
app.config['MYSQL_PASSWORD'] = 'the_password' #change
app.config['MYSQL_DB'] = 'the_database' #change

mysql = MySQL(app)

@app.route('/')
def home():
    # if 'username' in session:
    #     return render_template('home.html', username=session['username'])
    # return render_template('index.html')
    pass

@app.route('/register', methods=['POST'])
def register():
    # if request.method == 'POST':
    #     username = request.form['username']
    #     password = generate_password_hash(request.form['password'])
    #     
    #     cur = mysql.connection.cursor()
    #     cur.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password))
    #     mysql.connection.commit()
    #     cur.close()
    #     
    #     return redirect(url_for('login'))
    # return render_template('register.html')
    pass

@app.route('/login', methods=['POST'])
def login():
    # if request.method == 'POST':
    #     username = request.form['username']
    #     password = request.form['password']
    #     
    #     cur = mysql.connection.cursor()
    #     cur.execute("SELECT * FROM users WHERE username = %s", [username])
    #     user = cur.fetchone()
    #     cur.close()
    #     
    #     if user and check_password_hash(user[2], password):
    #         session['username'] = username
    #         return redirect(url_for('home'))
    #     else:
    #         return render_template('login.html', error="Invalid credentials. Try again.")
    # return render_template('login.html')
    pass

@app.route('/logout')
def logout():
    # session.pop('username', None)
    # return redirect(url_for('home'))
    pass

if __name__ == '__main__':
    app.run(debug=True)