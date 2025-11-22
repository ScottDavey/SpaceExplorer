/*********************************
*****  GAME: The Game Class  *****
*********************************/

class Game {

    constructor() {
        this.state = undefined;
        this.intro = undefined;
        this.mainMenu = undefined;
        this.level = undefined;
        this.gameMenu = undefined;
        this.isPauseLocked = false;
        this.debugKeyLocked = false;
    }

    Initialize() {
        this.state = GAME_STATES.PRIMARY.INTRO;
        this.intro = new Introduction();
        // SOUND_MANAGER.Initialize(this.state);
        this.gameMenu = new GameMenu();
    };

    Update() {
        const isPaused = this.gameMenu.GetIsPaused();
        // Update our Game Time each frame
        GameTime.update();

        INPUT.Update();

        // When we switch tabs the frame rate drops enough for the collision to stop working. We'll pause the game until the framerate comes back up
        if (FPS.GetFPS() > 30) {

            // Update Primary State first
            switch (this.state) {
                case GAME_STATES.PRIMARY.INTRO:
                    if (typeof this.intro === 'undefined') this.intro = new Introduction();
                    this.intro.Update();
                    // When the intro is finished, switch to main menu
                    if (this.intro.GetDone()) {
                        this.state = GAME_STATES.PRIMARY.MAIN_MENU;
                        this.intro = undefined;
                    }
                    break;

                case GAME_STATES.PRIMARY.MAIN_MENU:
                    if (typeof this.mainMenu === 'undefined') this.mainMenu = new MainMenu();
                    this.mainMenu.Update();
                    if (this.mainMenu.GetPlay()) {
                        this.mainMenu.UnloadContent();
                        this.mainMenu = undefined;
                        this.state = GAME_STATES.PRIMARY.PLAYING;
                    }
                    break;

                case GAME_STATES.PRIMARY.PLAYING:

                    if (INPUT.GetInput(KEY_BINDINGS.PAUSE)) {
                        if (!this.isPauseLocked) {
                            this.isPauseLocked = true;
                            this.gameMenu.SetIsPaused(!isPaused);
                        }
                    } else {
                        this.isPauseLocked = false;
                    }

                    if (!isPaused) {
                        if (typeof this.level === 'undefined') this.level = new Level();
                        this.level.Update();
                    }
                    break;
                    
                case GAME_STATES.PRIMARY.OUTRO:
                    break;
            }

        }

        if (isPaused) {
            this.gameMenu.Update();

            if (this.gameMenu.GetState() === GAME_MENU.EXIT) {
                this.state = GAME_STATES.PRIMARY.MAIN_MENU;
                this.level.UnloadContent();
                this.level = undefined;
                this.gameMenu.SetIsPaused(false);
                this.gameMenu.SetState(GAME_MENU.MAIN);
                INPUT.ClearInputs();
            }
        }

        // SOUND_MANAGER.Update(this.state, isPaused);

        if (INPUT.GetInput(KEY_BINDINGS.DEBUG)) {
            if (!this.debugKeyLocked) {
                this.debugKeyLocked = true;
                DEBUG.SetShowDebug();
            }
        } else {
            this.debugKeyLocked = false;
        }

        DEBUG.Update('FPS', `FPS: ${FPS.GetFPS()}`);
        DEBUG.Update('FPSLOW', `FPS (Lowest): ${FPS.GetLowestFPS()}`);
        DEBUG.Update('ISPAUSED', `Is Paused: ${isPaused ? 'YES' : 'NO'}`);
        DEBUG.Update('PAUSELOCK', `Is Paused Locked: ${this.isPauseLocked ? 'YES' : 'NO'}`);

    };

    Draw() {
        let state;

        // Clear the screen for re-drawing
        CONTEXT.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Update Primary State first
        switch (this.state) {
            case GAME_STATES.PRIMARY.INTRO:
                if (typeof this.intro !== 'undefined') this.intro.Draw();
                state = 'INTRO';
                break;
            case GAME_STATES.PRIMARY.MAIN_MENU:
                if (typeof this.mainMenu !== 'undefined') this.mainMenu.Draw();
                state = 'MAIN_MENU';
                break;
            case GAME_STATES.PRIMARY.PLAYING:
                if (typeof this.level !== 'undefined') {
                    this.level.Draw();
                    
                    if (this.gameMenu.GetIsPaused()) {
                        this.gameMenu.Draw();
                    }

                    DEBUG.Update('TIME', `Time: ${SecondsToTime(this.level.GetTimer())}`);
                }

                state = 'PLAYING';
                break;
            case GAME_STATES.PRIMARY.OUTRO:
                state = 'OUTRO';
                break;
        }

        // Put Music Song Name on screen
        // SOUND_MANAGER.Draw();

        // DEBUG
        DEBUG.Draw();

    };

}