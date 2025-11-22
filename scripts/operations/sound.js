/************************
*****  SOUND CLASS  *****
************************/

class Sound {

    constructor(path, type, isProximityBased, proximityMaxDistance, isLooping, vol, CanInterrupt = false) {
        this.type = type;
        this.isProximityBased = isProximityBased;
        this.proximityMaxDistance = proximityMaxDistance;
        this.canInterrupt = CanInterrupt;
        this.defaultVolume = vol;
        this.maxVolume = vol;
        this.audEl = document.createElement('audio');
        this.audEl.volume = this.maxVolume;
        this.audEl.setAttribute('src', path);
        this.audEl.setAttribute('preload', true);
        this.audEl.setAttribute('controls', false);
        if (isLooping) {
            this.audEl.setAttribute('loop', isLooping);
        }
    }

    Unload() {
        this.Stop();
        this.audEl = undefined;
    }

    Play() {
        this.audEl.play();
    }

    Stop() {
        this.audEl.pause();
    }

    StartOver() {
        this.audEl.currentTime = 0;
    }

    GetVolume() {
        return this.audEl.volume;
    }

    GetMaxVolume() {
        return this.maxVolume;
    }

    GetDefaultVolume() {
        return this.defaultVolume;
    }

    GetCurrentTime() {
        return this.audEl.currentTime;
    }

    GetDuration() {
        return this.audEl.duration;
    }

    GetIsProximityBased() {
        return this.isProximityBased;
    }

    GetProximityMaxDistance() {
        return this.proximityMaxDistance;
    }

    CanInterrupt() {
        return this.canInterrupt;
    }

    SetVolume(vol) {
        this.audEl.volume = vol;
    }

    SetMaxVolume(vol) {
        this.maxVolume = vol;
    }

    ToggleMute(isOn) {
        const newVol = isOn ? this.GetDefaultVolume() : 0;
        
        this.SetMaxVolume(newVol);
        this.SetVolume(newVol);
    }

    IsPlaying() {
        return !this.audEl.paused;
    }

}