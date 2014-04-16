#! /bin/env python2

#TODO: make it work on old terminals
#TODO: block user key press showing
#TODO: add option for colors change
#TODO: add support for 256colors
#FIXME: xfce-terminal produce some artifacts with unicode glyphs
import time, os, sys, signal
import argparse, re, math

#TODO: add more glyphs
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

class Canvas():

    def __init__(self, width, height):
        self.width = width
        self.height = height
        self._canvas = []
        for i in xrange(height):
            self._canvas.append([-1]*width)

    def putpixel(self, x, y, color):
        if 0 <= x < self.width and 0 <= y < self.height and -1 <= color < 8:
            self._canvas[y][x] = color

    def _ellipse_points(self, x0, y0, x, y, color):
        self.putpixel(x0+x,y0+y,color)
        self.putpixel(x0+x,y0-y,color)
        self.putpixel(x0-x,y0+y,color)
        self.putpixel(x0-x,y0-y,color)

    def draw_circle(self, x0, y0, r, color, width = 1):
        """
            Bresenham circle algorithm:
            According to http://wm.ite.pl/articles/bresenham.js
        """
        #TODO: add support for circle width

        d, x, y = 5-4*r, 0, r
        deltaA = (-2*r + 5)*4
        deltaB = 3*4

        while x<=y:
            self._ellipse_points(x0,y0,x,y,color)
            self._ellipse_points(x0,y0,y,x,color)
            if d > 0:
                d += deltaA
                y -= 1
                x += 1
                deltaA += 4*4
                deltaB += 2*2
            else:
                d += deltaB
                x += 1
                deltaA += 2*4
                deltaB += 2*4

    def draw_line(self, x0, y0, x1, y1, color, width = 1):
        #TODO: add support for line width
        dx, dy = x1-x0, y1-y0
        inc_x = 1 if dx>=1 else -1
        inc_y = 1 if dy>=1 else -1

        dx, dy = abs(dx), abs(dy)

        if dx >= dy:
            d = 2*dy - dx
            delta_A = 2*dy
            delta_B = 2*dy - 2*dx
            x, y = 0, 0
            for i in xrange(dx+1):
                self.putpixel(x+x0, y+y0, color)
                if d > 0:
                    d += delta_B
                    x += inc_x
                    y += inc_y
                else:
                    d += delta_A
                    x += inc_x
        else:
            d = 2*dx - dy
            delta_A = 2*dx
            delta_B = 2*dx - 2*dy
            x, y = 0, 0
            for i in xrange(dy+1):
                self.putpixel(x+x0, y+y0, color)
                if d > 0:
                    d += delta_B
                    x += inc_x
                    y += inc_y
                else:
                    d += delta_A
                    y += inc_y

    def put_text(self, x0, y0, text, color):
        pass

    def render(self, swidth, sheight, diff = False):
        #TODO: render only diff between last render
        #TODO: optimize amounth of escape sequence
        c = unichr(9600+5)
        res = []
        for y in xrange((self.height+1)/2):
            line = [goto((swidth-self.width)//2, (sheight-(self.height+1)/2)/2+y)]
            for x in xrange(self.width):
                a = self._canvas[2*y][x]
                b = self._canvas[2*y+1][x] if 2*y+1 < self.height else -1

                #TODO: add support for transparence
                #m = []
                #if a == -1 or b == -1:
                #    m.append('0')
                #if a != -1: m.append(str(30+a))
                #if b != -1: m.append(str(40+a))
                #line.append('\033['+';'.join(m)+'m'+c)
                a = 0 if a == -1 else a
                b = 0 if b == -1 else b
                line.append('\033['+str(30+b)+';'+str(40+a)+'m'+c)

            res.append(''.join(line))

        sys.stdout.write(''.join(res))
        sys.stdout.flush()



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

def show_clock(ms = False):
    while True:
        ct = time.time()
        if ms:
            m = int(100*(ct%1))
            printText(time.strftime('%H:%M:%S', time.localtime(ct))+'.'+(str(m).zfill(2)), width, (height-5)//2)
            time.sleep(0.08)
        else:
            printText(time.strftime('%H:%M:%S', time.localtime(ct)), width, (height-5)//2)
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
    
def show_visual(sec = False, radius = 39):
    c = Canvas(2*radius+1, 2*radius+1)
    x = 0
    while True:
        t = time.localtime()

        c.draw_circle(radius,radius,radius,1)
        c.draw_circle(radius,radius,radius-1,1)
        for i in xrange(12):
            dx = math.sin(2.0*math.pi*i/12)
            dy = math.cos(2.0*math.pi*i/12)
            if i%3 == 0:
                c.draw_line(radius+int(dx*radius), radius-int(dy*radius), radius+int(0.8*dx*radius), radius-int(0.8*dy*radius),1)
            else:
                c.draw_line(radius+int(dx*radius), radius-int(dy*radius), radius+int(0.9*dx*radius), radius-int(0.9*dy*radius),1)

        G = [((t[3]%12), 12, 0.4, 2), (t[4], 60, 0.6, 3), (t[5], 60, 0.8, 4)]
        for gnomon in G:
            dx = math.sin(2.0*math.pi*gnomon[0]/gnomon[1])
            dy = math.cos(2.0*math.pi*gnomon[0]/gnomon[1])

            c.draw_line(radius, radius, radius+int(dx*gnomon[2]*radius), radius-int(dy*gnomon[2]*radius), gnomon[3])
            c.draw_line(radius, radius, radius-int(dx*gnomon[2]*radius/4), radius+int(dy*gnomon[2]*radius/4), gnomon[3])

        c.render(width, height)
        time.sleep(1)

        for gnomon in G:
            dx = math.sin(2.0*math.pi*gnomon[0]/gnomon[1])
            dy = math.cos(2.0*math.pi*gnomon[0]/gnomon[1])

            c.draw_line(radius, radius, radius+int(dx*gnomon[2]*radius), radius-int(dy*gnomon[2]*radius), 0)
            c.draw_line(radius, radius, radius-int(dx*gnomon[2]*radius/4), radius+int(dy*gnomon[2]*radius/4), 0)



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
parser.add_argument('-b', '--binary', dest = 'binary', help = 'Show current time in binary', action = 'store_true')
parser.add_argument('-p', '--pomodoro', dest = 'pomodoro', help = 'Start pomodoro session', action='store_true')
parser.add_argument('-s', '--stopwatch', dest = 'stopwatch', help = 'Start stopwatch', action='store_true')
parser.add_argument('-n', '--no-progress', dest = 'progress', help ='Hide progressbar', action='store_false')
parser.add_argument('-a', '--alarm', dest = 'alarm', help = 'Show visual alarm on ...', action='store_true')
parser.add_argument('-m', '--miliseconds', dest = 'ms', help ='Count with resolution to 1/100 s', action='store_true')
parser.add_argument('-g', '--graphical', dest = 'visual', help = 'Display visual clock', action = 'store_true')

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
        dbbuffer(lambda: show_clock(ms = args.ms))
    elif args.binary == True:
        pass
    elif args.visual == True:
        dbbuffer(lambda: show_visual())
    else:
        parser.print_help()

except KeyboardInterrupt:
    pass
