#!/usr/bin/env python
"""
	NEKO_09 by Pawel 'Solmyr' Kubiak
	v0.1 - 2009-08-28 - Starting project - end coding 23:50
	v0.11 - 2009-08-29 - Adding gif encoded neko	
"""

import pygtk
pygtk.require('2.0')
import gtk
import gobject
from random import randint
from math import asin, sqrt
from base64 import decodestring

fps = 40
neko_gif = "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"
neko_frame = 0
neko_state = "NEKO_NORMAL"
neko_sec = fps
neko_anim_frame = -1
neko_x = -1
neko_y = -1
mouse_x = 0
mouse_y = 0
mouse_mods = 0

#sprawdz czy mysz sie ruszyla
def do_mouse_move():
	global mouse_x, mouse_y, mouse_mods
	rootwin = window.get_screen().get_root_window()
	x, y, mods = rootwin.get_pointer()
	if abs(mouse_x - x)>4 or abs(mouse_y - y)>4:
		mouse_x = x; mouse_y = y; mouse_mods = mods
		return True
	mouse_x = x; mouse_y = y; mouse_mods = mods
	return False	    

#odpowiedz kota na click:)
def on_neko_click(a,b):
	if b.button==2:
		gtk.main_quit()
	else:
		print 'Meow!!!'

#ustaw klatke animacji
def set_neko_frame(x):
	global neko_anim_frame
	if x==neko_anim_frame:
		return 1
	else:
		neko_anim_frame = x
	pixmap, mask = animation.get_static_image().subpixbuf(x*height,0,height,height).render_pixmap_and_mask()
	image.set_from_pixmap(pixmap, mask)
	window.shape_combine_mask(mask, 0, 0)	    

#glowna petla neko
def neko_main():
	global neko_frame, neko_state, neko_x, neko_y
	
	if do_mouse_move() and neko_state!="NEKO_RUNNING" and neko_state!="NEKO_AWAKE":
		neko_frame = 0
		neko_state = "NEKO_AWAKE"

	if neko_state=="NEKO_SLEEP":
		neko_frame += 1
		set_neko_frame (((neko_frame/neko_sec)%2)+19)
	elif neko_state=="NEKO_WAITING1":
		neko_frame += 1
		if neko_frame==5*neko_sec:
			neko_frame = 0 
			neko_state = "NEKO_GOSLEEP" 
		else:
			set_neko_frame(23+(neko_frame/(neko_sec/2))%2)
	elif neko_state=="NEKO_WAITING2":
		neko_frame += 1
		if neko_frame == 4*neko_sec:
			neko_frame = 0
			neko_state = "NEKO_GOSLEEP"
		else:
			set_neko_frame(21+(neko_frame/(neko_sec/4))%2)
	elif neko_state=="NEKO_GOSLEEP":
		neko_frame+=1
		if neko_frame==2*neko_sec:
			neko_frame = 0
			neko_state = "NEKO_SLEEP"
		else:
			set_neko_frame(18)
	elif neko_state=="NEKO_AWAKE":
		neko_frame+=1
		if neko_frame == neko_sec:
			neko_frame = 0
			neko_state = "NEKO_RUNNING"
		else:
			set_neko_frame(1)
	elif neko_state=="NEKO_RUNNING":
		neko_frame+=1
		if abs(neko_x - mouse_x)<16 and abs(neko_y - mouse_y)<16:
			neko_frame = 0
			neko_state = "NEKO_NORMAL"
		elif neko_frame%(neko_sec/4)==0:
			s = (mouse_y - neko_y)/sqrt((mouse_x - neko_x)**2 + (mouse_y - neko_y)**2)
			a = min( max(-90.0, asin(s)*180.0/3.1415926), 90.0)
			if mouse_x < neko_x:
				a = 180.0-a
			a = int(a+112.5)%360
			k = a/45
			set_neko_frame(2+2*k+(neko_frame/(neko_sec/2))%2)
			if k in (0,1,7):
				neko_y -= 15
			if k in (1,2,3):
				neko_x += 15
			if k in (3,4,5):
				neko_y += 15
			if k in (5,6,7):
				neko_x -= 15
			window.move(neko_x, neko_y)
	else:
		set_neko_frame(0)
		neko_frame+=1
		if neko_frame==7*neko_sec:
			neko_frame=0
			neko_state="NEKO_WAITING"+str(randint(1,2))

	return True

#eksportuje neko.gif
neko_gif = decodestring(neko_gif)
f = open('./neko.gif','wb')
f.write(neko_gif)
f.close()
	
#ustaw parametry okna
window = gtk.Window()
window.resize(32,32)
window.set_resizable(False)
window.stick()
window.set_keep_below(True)
window.set_decorated(False)
window.connect("delete-event", gtk.main_quit)
window.add_events(gtk.gdk.BUTTON_PRESS_MASK)
window.connect("button_press_event", on_neko_click)
window.move(512,512)
neko_x, neko_y = window.get_position() #pobierz poczatkowa pozycje okna

animation = gtk.gdk.PixbufAnimation('./neko.gif') #zaladuj animacje

#pobierz wymiary klatki
width = animation.get_width()
height = animation.get_height()

image = gtk.Image() #ustaw obraz

set_neko_frame(0) #ustaw startowa klatke animacji

do_mouse_move() #ustaw stan myszki

#wyswietl obiekty
image.show()
window.add(image)
window.show_all()

source_id = gobject.timeout_add(1000/fps, neko_main) #wykonuj obsluge neko

gtk.main() #rozpocznij glowna petle
