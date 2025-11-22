/************************************************
**************  TEXT BUTTON CLASS  **************
************************************************/
class TextButton {

    constructor(text, pos, font = { family: '"Century Gothic", sans-serif', size: 12, align: 'left' }, color, hoverColor, BGColor, hoverBGColor, isSelected = false) {
        this.text = text;
        this.pos = new Vector2(pos.x, pos.y);
        this.fontFamily = font.family;
        this.fontSize = font.size;
        this.align = font.align;
        this.originalFontColor = color;
        this.fontColor = this.originalFontColor;
        this.hoverColor = hoverColor;
        this.size = new Vector2(this.text.length * (this.fontSize * 0.65), (this.fontSize));
        this.BGColor = BGColor;
        this.hoverBGColor = hoverBGColor;
        this.isLeftClickLocked = false;
        this.isPushed = false;
        this.isSelected = isSelected;
        this.buttonText = new Text(
            this.text,
            new Vector2(this.pos.x, this.pos.y),
            this.fontFamily,
            'normal',
            this.fontSize,
            this.fontColor,
            this.align
        );
        this.selectedIcon = new Image(
            'images/icons/menu-marker.png',
            new Vector2(this.buttonText.GetPosition().x - 30, this.buttonText.GetPosition().y - 10),
            new Vector2(19, 19)
        );
        this.buttonTextWidth = 0;

        this.collision = new Collision();

        this.bounds = new Rectangle(
            this.pos.x,
            this.pos.y,
            this.buttonTextWidth,
            this.size.y
        );
    }

    SetIsSelected(isSelected) {
        this.isSelected = isSelected;
    }

    GetIsSelected() {
        return this.isSelected;
    }

    IsPushed() {
        return this.isPushed;
    }

    SetFontColor(color) {
        this.fontColor = color;
        this.buttonText.SetColor(this.fontColor);
    }

    SetText(text) {
        this.text = text;
        this.buttonText.SetString(this.text);
    }

    isPointerOver(pos) {
        const pointerRect = new Rectangle((pos.x - 2), (pos.y - 2), 4, 4);
        return this.collision.CheckBoxCollision(pointerRect, this.bounds);
    }

    // Based on a given pointer (mouse, touch control), check to see if we can perform an action on the button
    CheckPointerAction(pointerPos) {

        if (!this.isLeftClickLocked) {
            if (this.isPointerOver(pointerPos)) {
                this.isPushed = true;
            }
        }

    }

    Update() {

        const mousePos = INPUT.GetMousePosition();

        const fontColor = this.isSelected ? this.hoverColor : this.originalFontColor;
        this.SetFontColor(fontColor);

        if (this.isSelected && INPUT.GetInput(KEY_BINDINGS.CONFIRM)) {
            this.isPushed = true;
        }

        this.buttonTextWidth = this.buttonText.GetTextWidth();
        const buttonPosition = this.align === 'center' ?
            this.buttonText.GetCenteredTextPosition() :
            new Vector2(this.pos.x, this.pos.y - this.fontSize / 2);

        this.bounds.Update(buttonPosition);

        this.selectedIcon.Update(new Vector2(buttonPosition.x - 30, this.pos.y - 10));

    }

    Draw() {
        this.buttonText.Draw();
        if (this.isSelected) {
            this.selectedIcon.Draw();
        }
    }

}