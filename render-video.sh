#!/bin/bash

phantomjs src/scripts/renderer.js | ffmpeg -stats -y -c:v png -f image2pipe -r 25 -i \
- -frames 40 -c:v libx264 -pix_fmt yuv420p -movflags +faststart refugees.mp4




#ffmpeg -start_number 1 -i frames/image%03d.png -c:v libx264 -r 25 -pix_fmt yuv420p out.mp4