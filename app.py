import json
import os
from flask import Flask, render_template

app = Flask(__name__)

def load_agents():
    json_path = os.path.join(os.path.dirname(__file__), 'content.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route('/')
def index():
    agents = load_agents()
    return render_template('index.html', agents=agents)

if __name__ == '__main__':
    # Запуск локального сервера разработки на порту 5000
    app.run(host='127.0.0.1', port=5000, debug=True)