#! /bin/env python2

#TODO: make it work on old terminals
#TODO: block user key press showing
#TODO: add option for colors change

import time, os, sys, signal
import argparse, re

#add more glyphs
font = {
    '-': 208896,
    '1': 242966918,
    '0': 1070546175,
    '3': 1057812735,
    '2': 1058012223,
    '5': 1069805823,
    '4': 818933955,
    '7': 1057776006,
    '6': 1069808895,
    '9': 1070592255,
    '8': 516811998,
    #':': 3146496,
    ':':[
    "    ",
    " xx ",
    "    ",
    " xx ",
    "    "],
    '.':[
    "    ",
    "    ",
    "    ",
    "    ",
    " xx "]
}

def decode_font():
    global font
    for c in font:
        if type(font[c]) == int:
            res = []
            
            x = font[c]
            for i in xrange(5):
                line = []
                for j in xrange(6):
                    line.append('x' if (x&1) == 1 else ' ')
                    x = (x>>1)
                res.append(''.join(list(reversed(line))))
            font[c] = list(reversed(res))
            
def goto(x,y):
    return '\033['+str(y+1)+';'+str(x+1)+'H'

def printText(text,w,y):
    def colorify(match):
        return '\033[42m'+(' '*len(match.group()))+'\033[0m'
    
    global font
    O = [[] for i in range(5)]
    for i in text:
        if i in font:
            for j in xrange(5):
                O[j].append(font[i][j])
    
    X = re.compile('[x]+')
    
    R = []
    for j in xrange(5):
        s = ' '.join(O[j])
        l = (w-len(s))//2
        
        R.append(goto(l, j+y))
        
        s = X.sub(colorify, s)
        R.append(s)
        
    
    sys.stdout.write(''.join(R))
    sys.stdout.flush()
    

def printTime(sec,width,y,ms=False):
    sec = max(0, sec)
    
    if ms == True:
        h = long(sec)//60
        s = long(sec)%60
        ms = long(100*(sec%1))
        
        printText(str(h).zfill(2)+':'+str(s).zfill(2)+'.'+str(ms).zfill(2),width,y)
    else:
        h = long(sec)//60
        s = long(sec)%60
        
        printText(str(h).zfill(2)+':'+str(s).zfill(2),width,y)

def printProgress(f,w,y):
    dl = 30
    d = int(f*(dl-2)+0.5)    
    c = unichr(9600+5)
    
    sys.stdout.write(goto((w-dl)//2,y)+'\033[0;43m '+'\033[32m'+(c*d)+'\033[31m'+(c*(dl-2-d))+' \033[0m')
    sys.stdout.write(goto((w-dl)//2,y+1)+'\033[0;43m \033[0;33m'+'\033[42m'+(c*d)+'\033[41m'+(c*(dl-2-d))+'\033[0;43m \033[0m')
    


def set_size(signum = None, frame = None):
    global width, height
    #TODO: change into single escape sequence
    size = os.popen('stty size').readline().strip().split(' ')

    width = int(size[1])
    height = int(size[0])
    
def set_size_signal(signum = None, frame = None):
    set_size(signum, frame)
    sys.stdout.write('\033[2J')
    
def show_timer(sec,progress = True, ms = False):
    #print 'Countdown: '+sec
    st = time.time()
    ct = st

    while ct-st < sec:
        ct = time.time()
        printTime(sec-(ct-st), width, (height-8)//2, ms = ms)
        if progress:
            printProgress(1.0-min((ct-st)/float(sec),1.0), width, (height-8)/2+6)
        time.sleep(0.08)
    



#TODO: make it working
def show_alarm (freq = 0.5):
    blink = True
    while True:
        if blink:
            sys.stdout.write('\033[32;42m\033[2J');
            sys.stdout.flush()
        else:
            sys.stdout.write('\033[0m\033[2J');
            sys.stdout.flush()
        blink = not blink

        time.sleep(freq)

def show_clock():
    while True:
        ct = time.time()
        printText(time.strftime('%H:%M:%S'), width, (height-5)//2)
        time.sleep(0.499)
        
def show_pomodoro(progress = True, ms = False):
    while True:
        show_timer(25*60, progress = progress, ms = ms)
        raw_input('Press enter to continue')
        show_timer(5*60, progress = progress, ms = ms)


def show_stopwatch(ms = True):
    st = time.time()
    ct = st
    while True:
        ct = time.time()
        printTime(ct-st, width, (height-5)//2, ms = ms)
        time.sleep(0.08)
    

def dbbuffer(f):
    try:
        sys.stdout.write('\033[?1049h\033[0m\033[?25l')
        f ()
    finally:
        sys.stdout.write('\033[?1049l\033[0m\033[?25h')


decode_font()

width = 0
height = 0

signal.signal(signal.SIGWINCH, set_size_signal)

parser = argparse.ArgumentParser(description='Clock in terminal')

parser.add_argument('-t', '--timer', dest = 'timer', help ='Countdown some time', default=None, type=str)
parser.add_argument('-c', '--clock', dest = 'clock', help = 'Show current time', action = 'store_true')
parser.add_argument('-p', '--pomodoro', dest = 'pomodoro', help = 'Start pomodoro session', action='store_true')
parser.add_argument('-s', '--stopwatch', dest = 'stopwatch', help = 'Start stopwatch', action='store_true')
parser.add_argument('-n', '--no-progress', dest = 'progress', help ='Hide progressbar', action='store_false')
parser.add_argument('-a', '--alarm', dest = 'alarm', help = 'Show visual alarm on ...', action='store_true')
parser.add_argument('-m', '--miliseconds', dest = 'ms', help ='Count with resolution to 1/100 s', action='store_true')

args = parser.parse_args()

try:
    set_size()

    if args.timer is not None:
        if ':' in args.timer:
            t = args.timer.split(':')
            sec = 60*int(t[0])+int(t[1])
        else:
            sec = int(args.timer)
            
        dbbuffer(lambda: show_timer(sec, progress = args.progress, ms = args.ms))

    elif args.pomodoro == True:
        dbbuffer(lambda: show_pomodoro(progress = args.progress, ms = args.ms))
        
    elif args.stopwatch == True:
        dbbuffer(lambda: show_stopwatch(ms = args.ms))
        
    elif args.clock == True:
        dbbuffer(lambda: show_clock())
        
    else:
        parser.print_help()

except KeyboardInterrupt:
    pass
