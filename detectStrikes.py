#!/usr/bin/env nix-shell
#!nix-shell -i python3 -p "python3.withPackages(ps: [ps.pafy ps.tqdm])"
import pafy
import tqdm
import tracklistParser

with open("missing.csv") as f:
    missing = tracklistParser.read(f)

tracks = []
with open("tracklist.csv") as f:
    for track in tqdm.tqdm(tracklistParser.read(f)):
        try:
            pafy.new(track["youtubeId"]).title
            tracks.append(track)
        except IOError as e:
            missing.append(track)

with open("missing.csv", "w") as f:
    tracklistParser.write(f, missing)

with open("tracklist.csv", "w") as f:
    tracklistParser.write(f, tracks)
