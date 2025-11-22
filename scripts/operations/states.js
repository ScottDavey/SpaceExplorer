/*******************
*****  STATES  *****
*******************/

const GAME_STATES = {
    PRIMARY: {
        INTRO: 0,
        MAIN_MENU: 1,
        PLAYING: 2,
        OUTRO: 3,
        LOADING: 4
    },
    SECONDARY: {
        GAME_MENU: 0,
        OPTIONS_MENU: 1,
        TRANSITION: 2
    },
    LEVEL: {
        HUB: 0,
        SCENE: 1,
        BOSS: 2
    }
};

const GAME_MENU = {
    EXIT: -1,
    MAIN: 0,
    OPTIONS: 1,
    SOUND: 2
};

const MAIN_MENU = {
    MAIN: 0,
    OPTIONS: 1,
};

const BOSS_STATE = {
    PREINTRO: 0,
    INTRO: 1,
    IDLE: 2,
    ATTACK_INTRO: 3,
    ATTACKING: 4,
    CHASING: 5,
    STUNNED: 6,
    DYING: 7,
    DEAD: 8
};