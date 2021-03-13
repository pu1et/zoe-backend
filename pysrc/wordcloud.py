# coding: utf-8

import numpy as np
from konlpy.tag import Komoran 
import ujson
import pandas as pd
import csv
import sys
import json

data = []
data_pos = []
komoran = Komoran()

# PURPOSE: Nodejs에서 data를 읽어옴
# INPUT TYPE: data(String Array)
data = json.loads(sys.argv[1])['data']

for line in data:
    text = line.strip().replace("\n\n", " ").replace(",", " ").replace("\n", " ").replace('“'," ").replace('”'," ").replace('"',"")
    sentences = text.splitlines()
    for sentence in sentences:
        _datap = komoran.pos(sentence)  
    data_pos.append(_datap)

##treemap 그리는 부분

from sklearn.feature_extraction.text import TfidfVectorizer
import squarify
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import base64
import io

words = []
documents=[]
#FEATURE_POS = ["NNG", "VV", "VA", "MDT", "MAG", "NNP"]
FEATURE_POS = ["NNG", "VA", "MDT", "MAG", "NNP"]

for sent_pos in data_pos:
    for word, pos in sent_pos:
        if pos not in FEATURE_POS:
                        continue

        words.append(word)

document = " ".join(words)
documents.append(document)

vectorizer = TfidfVectorizer(tokenizer=str.split, max_features=100, norm="l1")

documents = np.asarray(documents)
doc_term_mat = vectorizer.fit_transform(documents)


def set_font():
    if sys.platform in ["win32", "win64"]:
        font_name = "malgun gothic"
      
    elif sys.platform == "darwin":
        font_name = "AppleGothic"

    elif sys.platform == "linux":
        font_location = '/usr/share/fonts/truetype/nanum/NanumGothic.ttf'
        font_name = fm.FontProperties(fname=font_location).get_name()
        
    matplotlib.rc("font", family=font_name)

# PURPOSE: 트리맵 그려서 base64형태로 출력
def draw_treemap(feature_name, count):
    set_font()
    squarify.plot(sizes=count, label=feature_name, alpha=0.4)
    
    plt.axis("off")
    
    # 현재 폴더에 tdf_treemap.png 파일명으로 저장, dpi는 그림 해상도 지정 
    # bbox_inches='tight'는 그림을 둘러싼 여백 제거 
    pic_IObytes = io.BytesIO()
    plt.savefig(pic_IObytes,  format='png')
    pic_IObytes.seek(0)
    pic_hash = base64.b64encode(pic_IObytes.read())
    print(pic_hash)
    
count = vectorizer.fit_transform(documents).toarray().sum(axis=0)    
idx = np.argsort(-count)
count = count[idx]
feature_name = np.array(vectorizer.get_feature_names())[idx]
draw_treemap(feature_name, count)