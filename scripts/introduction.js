/**************************************************
*****  INTRODUCTION: The Game's Introduction  *****
**************************************************/

class Introduction {

    constructor() {
        this.transitionIn = new Transition('0, 0, 0', 3, 'in');
        this.transitionOut = undefined; // Will be initialized later, once transitionIn is complete
        this.introText = new Text(
            'TBD',
            new Vector2(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2),
            '"Poiret One", sans-serif',
            'normal',
            45,
            '#FFFFFF',
            'center'
        );
        this.done = false;
    }

    GetDone() {
        return this.done;
    };

    Update() {
        const currentTime = GameTime.getCurrentGameTime();

        // If the In transition is not complete, continue
        if (!this.transitionIn.IsComplete()) this.transitionIn.update(currentTime);
        // If the In transition is complete, update the Out
        if (this.transitionIn.IsComplete()) {
            if (!this.transitionOut) this.transitionOut = new Transition('0, 0, 0', 3, 'out');
            this.transitionOut.update(currentTime);
            this.done = this.transitionOut.IsComplete();
        }

        // Exit intro early if ESCAPE key is pressed
        if (INPUT.GetInput(KEY_BINDINGS.PAUSE)) {
            this.done = true;
        }
    };

    Draw() {
        this.introText.Draw();

        if (!this.transitionIn.IsComplete()) this.transitionIn.draw();
        if (this.transitionIn.IsComplete() && this.transitionOut) this.transitionOut.draw();
    };

}