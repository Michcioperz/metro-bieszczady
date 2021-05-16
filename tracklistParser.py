import csv

fieldnames = ["artist", "title", "youtubeId", "startSeconds", "endSeconds", "official"]

def read(f):
    reader = csv.DictReader(f)
    return list(reader)

def write(f, tracks):
    writer = csv.DictWriter(f, fieldnames)
    writer.writeheader()
    writer.writerows(tracks)
