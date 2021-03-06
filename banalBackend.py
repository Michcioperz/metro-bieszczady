#!/usr/bin/env nix-shell
#!nix-shell -i python3 -p "python3.withPackages(ps: [ps.paho-mqtt])"
import json
import os
import paho.mqtt.publish
import random
import time
import tracklistParser

now = time.time() * 1000
while True:
    with open("tracklist.csv") as f:
        tracks = tracklistParser.read(f)
    track = random.choice(tracks)
    startSeconds = int(track["startSeconds"])
    endSeconds = int(track["endSeconds"])
    item = {
        "artist": track["artist"],
        "title": track["title"],
        "playbackStartUnixMillis": now,
        "sources": [
            {
                "module": "youtube",
                "videoId": track["youtubeId"],
                "startSeconds": startSeconds,
                "endSeconds": endSeconds,
            }
        ],
    }
    print(now, item)
    paho.mqtt.publish.single(
        "metro-bieszczady/tracks",
        json.dumps(item),
        retain=True,
        hostname=os.environ["MQTT_HOST"],
        port=int(os.environ["MQTT_PORT"]),
        tls={} if "MQTT_TLS" in os.environ else None,
        transport=os.environ["MQTT_TRANSPORT"],
        auth={
            "username": os.environ["MQTT_USER"],
            "password": os.environ["MQTT_PASSWORD"],
        },
    )
    time.sleep(endSeconds - startSeconds)
    now += (endSeconds - startSeconds) * 1000
