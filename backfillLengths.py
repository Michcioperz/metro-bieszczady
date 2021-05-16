#!/usr/bin/env nix-shell
#!nix-shell -i python3 -p "python3.withPackages(ps: [ps.pafy ps.tqdm])"
import pafy
import tqdm
import tracklistParser

with open("tracklist.csv") as f:
    tracks = tracklistParser.read(f)

for track in tqdm.tqdm(tracks):
    if track["endSeconds"] == "":
        track["endSeconds"] = str(pafy.new(track["youtubeId"]).length)

with open("tracklist.csv", "w") as f:
    tracklistParser.write(f, tracks)
