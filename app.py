from flask import Flask, request, render_template, redirect, url_for, send_file
import os
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor

app = Flask(__name__)

# 업로드된 이미지를 저장할 경로 설정
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
RESULT_FOLDER = "result"
app.config['RESULT_FOLDER'] = RESULT_FOLDER


if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

if not os.path.exists(PROCESSED_FOLDER):
    os.makedirs(PROCESSED_FOLDER)

if not os.path.exists(RESULT_FOLDER):
    os.makedirs(RESULT_FOLDER)


@app.route('/')
def upload_file():
    return render_template('main.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return '파일이 없습니다.'
    file = request.files['file']
    if file.filename == '':
        return '파일이 없습니다.'
    if file:
        # 파일 저장
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'upload_image.png')
        file.save(file_path)
        # demo.ipynb 실행
        processed_image_path = run_demo(file_path)
        return send_file(processed_image_path, mimetype='image/png')

def run_demo(image_path):
    try:
        # demo.ipynb 파일을 열기
        with open('demo.ipynb','r',encoding='utf-8') as f:
            nb = nbformat.read(f, as_version=4)

        # 이미지 경로를 노트북에 전달
        nb.cells[0].source = f"image_path = '{image_path}'"

        # 노트북 실행
        ep = ExecutePreprocessor(timeout=600, kernel_name='python3')
        ep.preprocess(nb, {'metadata': {'path': './'}})

        # 변환된 노트북 저장
        with open('demo_output.ipynb', 'w', encoding='utf-8') as f:
            nbformat.write(nb, f)

        # 처리된 이미지 경로
        processed_image_path = os.path.join(app.config['RESULT_FOLDER'], 'result_processed_image.png')
        return processed_image_path
    except PermissionError as e:
        print("권한 에러")
        return str(e)  # 권한 오류 메시지 반환
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    app.run(debug=True)
