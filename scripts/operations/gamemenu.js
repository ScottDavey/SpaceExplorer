/**********************************************
**************  GAME MENU CLASS  **************
**********************************************/

class GameMenu {

    constructor() {
        this.center = new Vector2(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        this.isPaused = false;
        this.state = undefined;
        this.numberOfElements = 0;
        this.pauseTextYPos = 175;
        this.initialOptionYPos = this.pauseTextYPos + 100;
        this.buttonHeight = 40;

        this.buttonFont = {
            family: 'Raleway, sans-serif',
            size: 30,
            align: 'center'
        };

        this.resumeButton = undefined;
        this.optionButton = undefined;
        this.toggleMusicButton = undefined;
        this.toggleSFXButton = undefined;
        this.backbutton = undefined;

        this.buttons = [];
        this.buttonDefaultColor = '#333333';
        this.buttonActiveColor = '#F4C430';

        this.selectedButtonIndex = 0;
        this.isConfirmInputLocked = false;
        this.isDownInputLocked = false;
        this.isUpInputLocked = false;
        this.isSelectButtonLocked = false;

        this.overlay = new Texture(
            new Vector2(0, 0),
            new Vector2(CANVAS_WIDTH, CANVAS_HEIGHT),
            '#00000099',
            0,
            '#00000000'
        );
        this.pausedText = new Text(
            'PAUSED',
            new Vector2(this.center.x, 175),
            'Jura, Consolas, "Century Gothic", sans-serif',
            'normal',
            70,
            '#FFFFFF',
            'center'
        );

        this.gameMenuItemMoveSoundID = 'gamemenuitem';
        this.gameMenuPlaySoundID = 'gamemenuplay';
        SOUND_MANAGER.AddEffect(this.gameMenuItemMoveSoundID, new Sound('sounds/effects/menu_item_move.ogg', 'SFX', false, null, false, 0.3, true));
        SOUND_MANAGER.AddEffect(this.gameMenuPlaySoundID, new Sound('sounds/effects/menu_start.ogg', 'SFX', false, null, false, 0.3, true));

        this.InitializeMain();
    }

    SetState(state) {
        this.state = state;
    }

    GetState() {
        return this.state;
    }

    InitializeMain() {
        this.state = GAME_MENU.MAIN;
        this.selectedButtonIndex = 0;
        this.buttons = [];

        this.buttons.push(
            {
                name: 'RESUME',
                obj: new TextButton(
                    'Resume Game',
                    new Vector2(this.center.x, this.initialOptionYPos + ((this.buttons.length - 1) * this.buttonHeight)),
                    this.buttonFont,
                    this.buttonDefaultColor,
                    this.buttonActiveColor,
                    '',
                    '',
                    true
                ), 
            }
        );
        
        this.buttons.push(
            {
                name: 'OPTIONS',
                obj: new TextButton(
                    'Options',
                    new Vector2(this.center.x, this.initialOptionYPos + ((this.buttons.length - 1) * this.buttonHeight)),
                    this.buttonFont,
                    this.buttonDefaultColor,
                    this.buttonActiveColor,
                    '',
                    '',
                    false
                ), 
            }
        );

        this.buttons.push(
            {
                name: 'EXIT',
                obj: new TextButton(
                    'Exit',
                    new Vector2(this.center.x, this.initialOptionYPos + ((this.buttons.length - 1) * this.buttonHeight)),
                    this.buttonFont,
                    this.buttonDefaultColor,
                    this.buttonActiveColor,
                    '',
                    '',
                    false
                ), 
            }
        );

        this.buttons[0].obj.SetIsSelected(true);
    }

    InitializeOptions() {
        this.state = GAME_MENU.OPTIONS;
        this.selectedButtonIndex = 0;
        this.buttons = [];
        const isMusicOn = SOUND_MANAGER.GetMusicOn() ? 'YES' : 'NO';
        const isSFXOn = SOUND_MANAGER.GetSFXOn() ? 'YES' : 'NO';

        this.buttons.push(
            {
                name: 'MUSIC',
                obj: new TextButton(
                    `Music: ${isMusicOn}`,
                    new Vector2(this.center.x, this.initialOptionYPos + ((this.buttons.length - 1) * this.buttonHeight)),
                    this.buttonFont,
                    this.buttonDefaultColor,
                    this.buttonActiveColor,
                    '',
                    '',
                    true
                ),
            }
        );
        
        this.buttons.push(
            {
                name: 'SFX',
                obj: new TextButton(
                    `SFX: ${isSFXOn}`,
                    new Vector2(this.center.x, this.initialOptionYPos + ((this.buttons.length - 1) * this.buttonHeight)),
                    this.buttonFont,
                    this.buttonDefaultColor,
                    this.buttonActiveColor,
                    '',
                    '',
                    false
                ),
            }
        );

        this.InitializeBack();
    }

    InitializeBack() {
        const yPosition = this.initialOptionYPos + (this.buttons.length + 1 * this.buttonHeight);
        // SUB STATES
        this.buttons.push(
            {
                name: 'BACK',
                obj: new TextButton(
                    'Back',
                    new Vector2(this.center.x, yPosition),
                    this.buttonFont,
                    this.buttonDefaultColor,
                    this.buttonActiveColor,
                    '',
                    '',
                    false
                ),
            }
        );
    }

    SetIsPaused(isPaused) {
        this.isPaused = isPaused;
        
        if (this.isPaused) {
            this.InitializeMain();
        }
    }

    GetIsPaused() {
        return this.isPaused;
    }

    HandleInput() {

        if (INPUT.GetInput(KEY_BINDINGS.DOWN)) {
            if (!this.isDownInputLocked) {
                const nextSelectedIndex = this.selectedButtonIndex + 1 > this.buttons.length - 1 ? 0 : this.selectedButtonIndex + 1;
                this.buttons[this.selectedButtonIndex].obj.SetIsSelected(false);
                this.buttons[nextSelectedIndex].obj.SetIsSelected(true);
                
                this.selectedButtonIndex = nextSelectedIndex;
                this.isDownInputLocked = true;

                SOUND_MANAGER.PlayEffect(this.gameMenuItemMoveSoundID);
            }
        } else {
            this.isDownInputLocked = false;
        }
        
        if (INPUT.GetInput(KEY_BINDINGS.UP)) {
            if (!this.isUpInputLocked) {
                const nextSelectedIndex = this.selectedButtonIndex - 1 < 0 ? this.buttons.length - 1 : this.selectedButtonIndex - 1;
                this.buttons[this.selectedButtonIndex].obj.SetIsSelected(false);
                this.buttons[nextSelectedIndex].obj.SetIsSelected(true);
                
                this.selectedButtonIndex = nextSelectedIndex;
                this.isUpInputLocked = true;

                SOUND_MANAGER.PlayEffect(this.gameMenuItemMoveSoundID);
            }
        } else {
            this.isUpInputLocked = false;
        }


        if (INPUT.GetInput(KEY_BINDINGS.CONFIRM)) {
            if (!this.isSelectButtonLocked) {

                SOUND_MANAGER.PlayEffect(this.gameMenuPlaySoundID);

                // Loop over buttons to see which one is selected
                for (const button of this.buttons) {
                    if (button.obj.GetIsSelected()) {

                        // MAIN
                        if (button.name === 'RESUME') {
                            this.SetIsPaused(false);
                        } else if (button.name === 'OPTIONS') {
                            this.InitializeOptions();
                        } else if (button.name === 'EXIT') {
                            this.state = GAME_MENU.EXIT;
                        }

                        // OPTIONS
                        if (button.name === 'MUSIC') {
                            const isMusicOn = SOUND_MANAGER.GetMusicOn();
                            SOUND_MANAGER.SetMusicOn(!isMusicOn);
                            button.obj.SetText(`Music: ${SOUND_MANAGER.GetMusicOn() ? 'YES' : 'NO'}`);
                        } else if (button.name === 'SFX') {
                            const isSFXOn = SOUND_MANAGER.GetSFXOn();
                            SOUND_MANAGER.SetSFXOn(!isSFXOn);
                            button.obj.SetText(`SFX: ${SOUND_MANAGER.GetSFXOn() ? 'YES' : 'NO'}`);
                        }

                        // BACK
                        if (button.name === 'BACK') {
                            this.InitializeMain();
                        }

                        break;
                    }
                }

                this.isSelectButtonLocked = true;
            }
        } else {
            this.isSelectButtonLocked = false;
        }

    }

    Update() {

        this.HandleInput();

        for (const button of this.buttons) {
            button.obj.Update();
        }

        if (this.state === GAME_MENU.EXIT) {
            INPUT.ClearInputs();
        }

    }

    Draw() {
        this.overlay.Draw();
        this.pausedText.Draw();

        for (const button of this.buttons) {
            button.obj.Draw();
        }
    }
}