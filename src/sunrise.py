#!/usr/bin/env python3 

 

# Simple demo of of the WS2801/SPI-like addressable RGB LED lights. 

import time 

import RPi.GPIO as GPIO 

  

# Import the WS2801 module. 

import Adafruit_WS2801 

import Adafruit_GPIO.SPI as SPI 

 

 

# Configure the count of pixels: 

PIXEL_COUNT = 32 

 

# Alternatively specify a hardware SPI connection on /dev/spidev0.0: 

SPI_PORT   = 0 

SPI_DEVICE = 0 

pixels = Adafruit_WS2801.WS2801Pixels(PIXEL_COUNT, spi=SPI.SpiDev(SPI_PORT, SPI_DEVICE), gpio=GPIO) 

 

GPIO.setwarnings(False) # Ignore warning for now 

GPIO.setmode(GPIO.BOARD) # Use physical pin numbering 

GPIO.setup(10, GPIO.IN, pull_up_down=GPIO.PUD_DOWN) 

 

 

def brightness_decrease(pixels, wait=0.1, step=1): 

    r, g, b = pixels.get_pixel_rgb(0) 

    for j in range(int(256 // step)): 

        r += step 

        g += step  

        b += step 

        print(r) 

        for i in range(pixels.count()): 

            if (button_push(10)): 

                pixels.clear() 

                pixels.show() 

                return 0 

            pixels.set_pixel(i, Adafruit_WS2801.RGB_to_color( r, int(g), int(b) )) 

        pixels.show() 

        if wait > 0: 

            time.sleep(wait) 

 

def button_push(pin): 

    if (GPIO.input(pin) == GPIO.HIGH): 

        return 1 

    return 0 

 

pixels.clear() 

pixels.show() 

time.sleep(1) 

for i in range(pixels.count()):	 

pixels.set_pixel(i, Adafruit_WS2801.RGB_to_color( 0, 0, 0 )) 

brightness_decrease(pixels, 0.1) 
