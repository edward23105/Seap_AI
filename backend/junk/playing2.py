from ollama import ChatResponse
from ollama import chat 
from ollama import generate

def chat_mode(model,text):

	stream = chat(
		model=model,
		messages= [{'role':'user','content':text}],
		stream = True,
		)

	data_ = []
	for chunk in stream:
		part = chunk.get('message',{}).get('content','')
		if part:
			data_.append(part)

	return data_

def summarize(text,summarize_type):
	stream = generate(
		model= 'raaec/llama3.1-8b-instruct-summarize',
		prompt= f"Fa din textul urmator {summarize_type}:\n\n{text}\n\nSummary:",
		stream= True,
		)
	summarized_data = ""
	for chunk in stream:
		part = chunk.get("response","")
		summarized_data = summarized_data + part

	return summarized_data


def main():
	text ="A qubit is the fundamental unit of information in quantum computing, analogous to the classical bit. Unlike a classical bit, which can only be a 0 or a 1, a qubit can exist in a state of 0, 1, or a superposition of both at the same time. This ability to be in multiple states simultaneously allows quantum computers to process information much more efficiently for certain types of problems. "
	
	print(summarize(text,"un titlu"))
	print("\n\n")
	print(summarize(text,"o descriere scurta"))

#main()



