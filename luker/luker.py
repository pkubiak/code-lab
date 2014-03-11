import sys, random, re

f = sys.stdin.read()
g = f

t = ['\n', ',', '.', ';', '-', '"']
for i in t:
	g = g.replace(i, ' ')

g = g.split(' ')
d = {}

for i in g:
	w = i.lower().strip()
	if w == '':
		continue

	if w in d:
		d[w]+=1
	else:
		d[w] = 1

p = ['is', 'are', 'isn\'t', 'aren\'t', 'am', 'to', 'of', 'for', 'in', 'at', 'or', 'and', 'you', 'we', 'she', 'he', 'they', 'a', 'an', 'the', 'it', 'i', 'he\'s', 'it\'s' ]
for i in d:
	if len(i)<3:
		p.append(i)
		
for i in p:
	if i in d:
		del(d[i])


n = int(sys.argv[1])
K = d.keys()
D = []
#print K
#print len(K)
n = int(sys.argv[1])

while n>0 and len(K)>0:
	x = random.randint(0, len(K)-1)
	D.append(K[x])
	n-=d[K[x]]
	del(K[x])
	
#print D

orig = f

for i in D:
	r = re.compile('\\b'+re.escape(i)+'\\b', re.IGNORECASE)
	f = r.sub('<b><i>'+'X'*(len(i)+2)+'</i></b>', f)


#print f


print '<style type="text/css">b{display:inline-block;border:2px solid black;color:white;margin:2px;}i{visibility:hidden;}</style>'
print '<body style="line-height:120%;font-size:10pt;font-family:sans;">'
print '<div style="page-break-after:always;"><h1>Original</h1><p style="text-align:center">'+orig.replace('\n','<br/>')+'</p></div>'
print '<div style="page-break-after:always;"><h1>To Solve</h1><p style="text-align:center">'+f.replace('\n','<br/>')+'</p></div>'
print '</body>'


