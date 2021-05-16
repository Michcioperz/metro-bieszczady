class Track {
  artist!: string;
  title!: string;
  sources!: Source[];
  playbackStartUnixMillis!: number;
}

interface Source {
  module: "youtube";
}

class YTTrack implements Source {
  module: "youtube" = "youtube";
  videoId!: string;
  startSeconds!: number;
  endSeconds!: number;
}

class Metro {
  rain!: HTMLAudioElement;
  player!: YT.Player;
  client!: Paho.MQTT.Client;
  readyTime!: Date;
  
  constructor() {
    this.enableRain();
  }

  enableRain(): void {
    this.rain = document.createElement("audio");
    this.rain.loop = true;
    this.rain.autoplay = true;
    this.rain.src = "https://archive.org/download/RainyMood_201311/RainyMood.ogg";
    document.body.appendChild(this.rain);
  }

  connect(): void {
    this.readyTime = new Date();
    this.client = new Paho.MQTT.Client("wss://mqtt.koguma.iscute.ovh/mqtt", "metro-bieszczady");
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.connect({onSuccess: this.onMqttConnect.bind(this), userName: "public", password: "public"});
  }

  createPlayer(): void {
    this.player = new YT.Player("player", {
      height: 100,
      width: 100,
    });
    this.player.addEventListener("onReady", this.connect.bind(this));
    this.player.addEventListener("onStateChange", this.onStateChange.bind(this));
  }

  enqueue(track: Track): void {
    const history = document.getElementById("history")!;
    const dd = document.createElement("dd");
    dd.innerText = `${track.artist} - ${track.title}`;
    history.insertBefore(dd, history.firstChild);
    const dt = document.createElement("dt");
    const trackTime = new Date(track.playbackStartUnixMillis);
    dt.innerText = new Intl.DateTimeFormat('default', {hour: "numeric", minute: "numeric", second: "numeric", hour12: false}).format(trackTime);
    history.insertBefore(dt, history.firstChild);
    document.getElementById("playerHeadline")!.innerText = `${track.artist} - ${track.title}`;
    for (const someSource of track.sources) {
      if (someSource.module == "youtube") {
        const source = someSource as YTTrack;
        const startSeconds = Math.max(0, (this.readyTime.valueOf() - track.playbackStartUnixMillis) / 1000);
        const playbackSource: YT.VideoByIdSettings = {
          videoId: source.videoId,
          startSeconds: startSeconds,
          endSeconds: source.endSeconds,
          suggestedQuality: "small",
        };
        this.player.cueVideoById(playbackSource);
        break;
      }
    }
  }

  onStateChange(): void {
    switch (this.player.getPlayerState()) {
      case YT.PlayerState.CUED:
        this.player.playVideo();
        break;
    }
  }

  onMessageArrived(message: Paho.MQTT.Message): void {
    const payload: Track = JSON.parse(message.payloadString);
    this.enqueue(payload);
  }

  onMqttConnect(): void {
    this.client.subscribe("metro-bieszczady/tracks");
  }
}

const metro = new Metro();

function onYouTubeIframeAPIReady() {
  metro.createPlayer();
}
