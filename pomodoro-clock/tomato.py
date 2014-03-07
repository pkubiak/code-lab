#! /bin/env python2

import time, os, sys, signal

font = {
':': [
"      ",
"  xx  ",
"      ",
"  xx  ",
"      "],
'1':[
"  xxx ",
" xxxx ",
"xx xx ",
"   xx ",
"   xx "],
'2':[
"xxxxxx",
"    xx",
"xxxxxx",
"xx    ",
"xxxxxx"],
'3':[
"xxxxxx",
"    xx",
"  xxxx",
"    xx",
"xxxxxx"],
'4':[
"xx    ",
"xx  xx",
"xxxxxx",
"    xx",
"    xx"],
'5':[
"xxxxxx",
"xx    ",
"xxxxxx",
"    xx",
"xxxxxx"],
'6':[
"xxxxxx",
"xx    ",
"xxxxxx",
"xx  xx",
"xxxxxx"],
'7':[
"xxxxxx",
"    xx",
"   xx ",
"   xx ",
"   xx "],
'8':[
" xxxx ",
"xx  xx",
" xxxx ",
"xx  xx",
" xxxx "],
'9':[
"xxxxxx",
"xx  xx",
"xxxxxx",
"    xx",
"xxxxxx"],
'0':[
"xxxxxx",
"xx  xx",
"xx  xx",
"xx  xx",
"xxxxxx"],
'-':[
"      ",
"      ",
"xx  xx",
"      ",
"      "]
}


def printText(text,w):
	global font
	O = [[] for i in range(5)]
	for i in text:
		if i in font:
			for j in xrange(5):
				O[j].append(font[i][j])
	
	for j in xrange(5):
		s = ' '.join(O[j])
		s = ' '*((w-len(s))//2)+s
		s = s.replace('x','\033[42m \033[0m')
		print s

def printTime(sec,width):
	h = sec//60
	s = sec%60
	printText(str(h).zfill(2)+':'+str(s).zfill(2),width)

#def printProgress2(f,w):
#	dl = 30
#	d = int(f*(dl-2)+0.5)	
#	print (' '*((w-dl)/2))+'\033[0;33m'+(unichr(9600+5)*dl)+'\033[0m'
#	print (' '*((w-dl)/2))+'\033[0;43m'+' '+'\033[42m'+(' '*d)+'\033[41m'+(' '*(dl-2-d))+'\033[43m'+' '+'\033[0m'
#	print (' '*((w-dl)/2))+'\033[0;33m'+(unichr(9600)*dl)+'\033[0m'

def printProgress(f,w):
	dl = 30
	d = int(f*(dl-2)+0.5)	
	c = unichr(9600+5)
	print (' '*((w-dl)/2))+'\033[0;43m '+'\033[32m'+(c*d)+'\033[31m'+(c*(dl-2-d))+' \033[0m'
	print (' '*((w-dl)/2))+'\033[0;43m \033[0;33m'+'\033[42m'+(c*d)+'\033[41m'+(c*(dl-2-d))+'\033[0;43m \033[0m'


def set_size(signum = None, frame = None):
	global width, height
	size = os.popen('stty size').readline().strip().split(' ')
	width = int(size[1])
	height = int(size[0])

width = 0
height = 0

signal.signal(signal.SIGWINCH, set_size)

try:
	sys.stdout.write('\033[?1049h\033[?25l')
	set_size()
	

	pomodoro = False
	if len(sys.argv)==1:
		pomodoro = True
		sec = 25*60
	elif ':' in sys.argv[1]:
		t = sys.argv[1].split(':')
		sec = 60*int(t[0])+int(t[1])
	else:
		sec = int(sys.argv[1])

	while True:
		st = time.time()
		ct = st
		while ct-st<sec:
			ct = time.time()
			sys.stdout.write('\033[H\033[J\033['+str(1+(height-8)/2)+'H')
			printTime(int(sec-int(ct-st)), width)
			print
			printProgress(1.0-min((ct-st)/float(sec),1.0), width)
			time.sleep(1)
		if not pomodoro:
			break
		raw_input('Press enter to continue')
		if sec==25*60:
			sec = 5*60
		else:
			sec = 25*60
	sys.stdout.write('\033[?1049l\033[?25h')
except:
	sys.stdout.write('\033[?1049l\033[?25h')
