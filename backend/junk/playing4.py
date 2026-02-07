
def main():
	lista = [3,65,42,8,35,245,4345,7,35,4]
	
	a = 0 
	b = 0
	c = 0

	for x in lista:
		if x >= a:
			c = b
			b = a
			a = x
		elif x >= b:
			c = b
			b = x
		elif x >= c:
			c = x
	print("a " + str(a) + " b " + str(b) + " c " + str(c))

main()