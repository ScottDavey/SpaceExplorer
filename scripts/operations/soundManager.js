
/********************************
*****  SOUND MANAGER CLASS  *****
********************************/

class SoundManager {

    constructor() {
        this.previousGameState = undefined;
        this.gameState = undefined;
        this.gameSubState = undefined;
        this.isGamePaused = false;
        this.muteAll = false;
        this.isBossSequence = false;
        this.wasBossSequence = false;

        // MUSIC
        this.isMusicOn = true;
        this.defaultVolume = 0.3;
        this.pauseVolume = (this.defaultVolume / 3).toFixed(2);
        this.musicVolume = this.defaultVolume;
        this.music = [];
        this.isMusicPlaying = false;
        this.currentSong = undefined;
        this.currentSongName = 'None';
        this.bossMusic = undefined;
        this.bossMusicName = undefined;
        this.nextSong = undefined;
        this.currentSongIndex = -1;
        this.currentSongHUB = new Text(
            'Music: None',
            new Vector2(CANVAS_WIDTH - 30, 30),
            'Lobster, "Century Gothic", sans-serif',
            'normal',
            18,
            '#FFFFFF88',
            'right'
        );

        this.isFading = false;
        this.fadeDirection = -1;
        this.fadeDuration = 10;
        this.fadeTimer = undefined;

        // SFX
        this.isSFXOn = true;
        this.effects = [];
        this.effectsToRemove = [];  // If we remove an entity but it still has a sound to play
        this.playerPosition = new Vector2(0, 0);
    }

    Initialize(gameState) {
        const music = SOUNDS.music;

        for (const song of music) {
            this.music.push(song);
        }

        this.gameState = gameState;
        this.previousGameState = this.gameState;
    }

    LoadBossMusic() {
        const bossMusic = this.music.find(e => e.region === 'BOSS');
        
        this.bossMusicName = bossMusic.name;
        
        this.bossMusic = new Sound(
            `sounds/music/${bossMusic.path}`,
            'MUSIC',
            false,
            null,
            bossMusic.isLooping,
            this.musicVolume,
            false
        )
    }

    GetMusicOn() {
        return this.isMusicOn;
    }

    GetSFXOn() {
        return this.isSFXOn;
    }

    GetEffects() {
        return this.effects;
    }

    SetPlayerPosition(position) {
        this.playerPosition = position;
    }

    SetBossSequence(isBossSequence) {
        this.isBossSequence = isBossSequence;
    }
    
    SetEffectMaxVolume(id, vol) {
        const effect = this.FindEffectByID(id);
        
        if (effect) {
            effect.sound.SetMaxVolume(vol);
        }
    }

    SetMusicOn(isOn) {
        this.isMusicOn = isOn;

        // Turn off/on the music
        if (!this.isMusicOn) {
            if (this.currentSong && this.currentSong.IsPlaying()) {
                this.currentSong.Stop();
            }

            if (this.bossMusic && this.bossMusic.IsPlaying()) {
                this.bossMusic.Stop();
            }

            this.currentSongHUB.SetString(`Music: None`);
        } else {

            if (this.currentSong && !this.currentSong.IsPlaying()) {
                this.currentSong.Play();

                this.currentSongHUB.SetString(`Music: ${this.currentSongName}`);
            }

            if (this.bossMusic && !this.bossMusic.IsPlaying()) {
                this.bossMusic.Play();
                
                this.currentSongHUB.SetString(`Music: ${this.bossMusicName}`);
            }

        }
    }

    SetSFXOn(isOn) {
        this.isSFXOn = isOn;

        // Instead of turning sound effect on/off, we'll just reduce their volume
        //  and prevent them from starting in the PlayEffect function
        for (const sfx of this.effects) {
            sfx.sound.ToggleMute(this.isSFXOn);
        }

    }

    SetGameState(state) {
        this.gameState = state;
    }

    AddEffect(id, sound) {

        // Don't add if we already have one with the same id
        if (this.DoesEffectExist(id)) {
            return;
        }

        this.effects.push({ id, sound });
    }

    RemoveEffect(id, whenDone = false) {
        const effect = this.FindEffectByID(id);
        
        if (effect) {

            // If the effect is still playing, add it to a queue that will be removed when it's done
            if (whenDone) {
                this.effectsToRemove.push(effect);
            } else {
                effect.sound.Stop();
                effect.sound = undefined;
                this.effects.splice(this.effects.findIndex(effect => effect.id === id), 1);
            }

        }
    }

    RemoveQueuedEffects() {
        for (const ind in this.effectsToRemove) {
            const effect = this.effectsToRemove[ind];

            // If it's done playing, remove it
            if (!effect.sound.IsPlaying()) {
                effect.sound.Stop();
                effect.sound = undefined;

                // Remove from our main effects array
                this.effects.splice(this.effects.findIndex(mainFX => mainFX.id === effect.id), 1);

                // Remove from our queue
                this.effectsToRemove.splice(ind, 1);
            }
        }
    }

    RemoveAllEffects() {
        for (const ind in this.effects) {
            const effect = this.effects[ind];
            
            if (effect.id !== 'gamemenuitem' && effect.id !== 'gamemenuplay') {
                this.effects[ind].sound.Unload();
                this.effects[ind].sound = undefined;
                this.effects.splice(ind, 1);
            }
        }
    }

    StopMusic() {
        if (this.bossMusic && this.isBossSequence) {
            this.bossMusic.Stop();
        } else if (this.currentSong) {
            this.currentSong.Stop();
        }
    }

    ResumeMusic() {
        if (this.bossMusic && this.isBossSequence) {
            this.bossMusic.Play();
        } else if (this.currentSong) {
            this.currentSong.Play();
        }
    }

    PlayEffect(id, sourcePosition = new Vector2(0, 0)) {

        // If the user has turned off the sound, abort
        if (!this.isSFXOn) {
            return;
        }

        const effect = this.FindEffectByID(id);

        if (!effect) {
            return;
        }

        const maxVolumeDistance = effect.sound.GetProximityMaxDistance();
        
        if (effect.sound.GetIsProximityBased()) {
        
            const deltaX = Math.pow(sourcePosition.x - this.playerPosition.x, 2);
            const deltaY = Math.pow(sourcePosition.y - this.playerPosition.y, 2);
            const delta = Math.sqrt(deltaX + deltaY);

            if (!isFinite(delta)) {
                console.error(
                    'Play Effect Error: Delta is non-finite',
                    { sourcePosition, playerPosition: this.playerPosition, deltaX, deltaY, delta }
                );
                return;
            }

            let volume = 0;

            if (maxVolumeDistance > 0 && delta < maxVolumeDistance) {

                const maxVolume = effect.sound.GetMaxVolume()

                // Calculate the volume based on the distance from the player.
                //  Ensure it doesn't go outside of the volume limits
                volume = maxVolume - (maxVolume * (delta / maxVolumeDistance));
                volume = Clamp(volume, 0, maxVolume);

                if (!isFinite(volume)) {
                    console.error(
                        'Play Effect Error: Volume is non-finite',
                        { maxVolume, delta, volume }
                    );
                    return;
                }

                if (!effect.sound.IsPlaying()) {
                    effect.sound.Play();
                }

                effect.sound.SetVolume(volume);
            } else {
                effect.sound.SetVolume(0);
                effect.sound.Stop();
            }
            
        } else {
            effect.sound.Play();
        }
        
        if (effect.sound.IsPlaying() && effect.sound.CanInterrupt()) {
            effect.sound.StartOver();
        }
        
    }

    DoesEffectExist(id) {
        let doesExist = false;

        for (const effect of this.effects) {
            if (effect.id === id) {
                doesExist = true;
                break;
            }
        }

        return doesExist;
    }

    FindEffectByID(id) {
        return this.effects.find(effect => effect.id === id);
    }
    
    Fade(song) {

        if (!song) {
            return;
        }

        if (!this.fadeTimer) {
            this.fadeTimer = new Timer(GameTime.getCurrentGameTime(), this.fadeDuration);
        }

        if (this.fadeTimer.IsComplete() || !song) {
            this.fadeTimer = undefined;
            this.isFading = false;
            this.fadeDirection = this.fadeDirection < 0 ? 1 : -1;
            return;
        }

        const fadeTimerRemainder = this.fadeTimer.GetRemainder(5);
        const musicVolume = song.GetVolume();
        let newVolume;

        if (this.fadeDirection < 0) {
            // Fade Out by multiplying the total music volume by the percentage of remaining time
            newVolume = +(musicVolume * (fadeTimerRemainder / this.fadeDuration));

            if (newVolume < (0.01)) {
                newVolume = 0;
            }
        } else {
            // Fade in by multiplying the total volume by the percentage of time elapsed
            const timeElapsed = this.fadeDuration - fadeTimerRemainder;
            newVolume = +(musicVolume * (timeElapsed / this.fadeDuration));

            // Cap the volume at the max level if we're close to 99% of it.
            if (newVolume > (musicVolume * 0.99)) {
                newVolume = musicVolume;
            }

        }

        song.SetVolume(newVolume);

    }

    HandleMusic(gameState, isPaused) {

        // If the user has turned music off, don't continue
        if (!this.isMusicOn) {
            return;
        }

        let song = undefined;

        // MUSIC

        // Check our state and set up an appropriate song
        if (gameState === GAME_STATES.PRIMARY.MAIN_MENU) {

            if (!this.currentSong) {
                song = this.music.find(e => e.region === 'MAIN MENU');
            } else {
                const songTimeRemaining = this.currentSong.GetDuration() - this.currentSong.GetCurrentTime();

                // If our song is getting close to ending, fade it out
                if (!this.isFading && this.currentSong && songTimeRemaining <= this.fadeDuration) {
                    this.isFading = true;
                    this.fadeDirection = -1;
                }

                // After fasing out, we need to reset the volume 
                if (this.isFading && songTimeRemaining <= 0) {
                    this.isFading = false;
                    this.currentSong.SetVolume(this.musicVolume);
                }
            }

        } else if (gameState === GAME_STATES.PRIMARY.PLAYING) {

            if (this.isBossSequence) {

                if (!this.bossMusic) {
                    this.LoadBossMusic();
                }

                if (this.currentSong.IsPlaying()) {
                    if (this.currentSong.GetVolume() > 0) {
                        this.Fade(this.currentSong);
                    } else {
                        this.currentSong.Stop();
                    }
                } else {

                    if (!this.bossMusic.IsPlaying()) {
                        this.bossMusic.SetVolume(this.musicVolume);
                        this.bossMusic.Play();
                    }

                }

                this.currentSongHUB.SetString(`Music: ${this.bossMusicName}`);

                if (isPaused) {
                    this.bossMusic.SetVolume(this.pauseVolume);
                } else {
                    this.bossMusic.SetVolume(this.defaultVolume);
                }

                return;
            }

            // If the boss music is playing, it shouldn't be. Fade it out and start the currentSong back up once it's done
            if (this.bossMusic && this.bossMusic.IsPlaying()) {

                this.fadeDirection = -1;

                if (this.bossMusic.GetVolume() > 0) {
                    this.Fade(this.bossMusic);
                } else {
                    this.bossMusic.Stop();
                    this.bossMusic = undefined;
                }

                // This is so we can resume the previous song when the boss sequence is finished.
                this.wasBossSequence = true;

            } else if (this.currentSong && !this.currentSong.IsPlaying() && this.wasBossSequence) {

                this.fadeDirection = 1;
                this.currentSong.Play();

                if (this.currentSong.GetVolume() < this.musicVolume) {
                    this.Fade(this.currentSong);
                } else {
                    // Once the previous song is back up and running, we're out of the transition
                    this.wasBossSequence = false;
                }


            }
        
            if (this.currentSong) {
                const songTimeRemaining = this.currentSong.GetDuration() - this.currentSong.GetCurrentTime();

                // If our song is getting close to ending, fade it out
                if (!this.isFading && this.currentSong && songTimeRemaining <= this.fadeDuration) {
                    this.isFading = true;
                    this.fadeDirection = -1;
                }

                // If our song has ended, set current song to undefined
                if (this.currentSong && songTimeRemaining <= 0) {
                    this.currentSong.Stop();
                    this.currentSong = undefined;
                    this.isMusicPlaying = false;
                }
            } else {
                const possibleSongs = this.music
                    .map((song, index) => (song.region === 'LEVEL' && this.currentSongIndex !== index) ? index : -1)
                    .filter(index => index !== -1);

                const randomSongIndex = possibleSongs[random(0, possibleSongs.length - 1)];
                
                song = this.music[randomSongIndex];

                this.currentSongIndex = randomSongIndex;
            }

        }

        // We've changed states, stop the music so a new song can start
        if (this.previousGameState !== this.gameState && this.currentSong) {
            this.currentSong.Stop();
            this.isMusicPlaying = false;
            this.currentSong = undefined;
            this.nextSong = undefined;
            this.currentSongName = 'None';
            if (this.bossMusic && this.bossMusic.IsPlaying()) {
                this.bossMusic.Stop();
                this.bossMusic = undefined;
                this.isBossSequence = false;
            }

            // Keep track of the previous game state
            this.previousGameState = this.gameState;
        }

        // If we don't have a current song, but we have one sorted out, create it
        if (!this.currentSong && song) {
            this.currentSong = new Sound(
                `sounds/music/${song.path}`,
                'MUSIC',
                false,
                null,
                song.isLooping,
                this.musicVolume,
                false
            );
            this.currentSongName = song.name;
        }

        // If we're not playing, and we have a song queued up, play it.
        if (!this.isMusicPlaying && this.currentSong) {
            this.isMusicPlaying = true;
            this.currentSong.Play();
        }

        if (this.isMusicPlaying && this.currentSong) {
            if (isPaused) {
                this.currentSong.SetVolume(this.pauseVolume);
            } else {
                this.currentSong.SetVolume(this.defaultVolume);
            }
        }

        this.isGamePaused = isPaused;

        // Set our current game state
        this.gameState = gameState;

        this.currentSongHUB.SetString(`Music: ${this.currentSongName}`);
    }

    Update(gameState, isPaused) {

        this.HandleMusic(gameState, isPaused);

        // Make sure to clean up any effects that need removing
        this.RemoveQueuedEffects();

        DEBUG.Update('SFXCOUNT', `SFX Count: ${this.effects.length}`);

    }

    Draw() {
        this.currentSongHUB.Draw();
    }

}