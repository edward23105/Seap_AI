import json
import requests

def main():
    res = requests.post('http://127.0.0.1:8000/summarize',
        json = {

        "title":"I am Darius from Moldova the Great, I am an minimum wage worker in a 3rd world country.",
        "description":"Darius is the most powerfull Moldovean of them all becouse he drinks vodka and does mma to beat bear.",
        },)
    resp = res.text
    print(resp)

main()