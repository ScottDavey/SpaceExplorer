/**************************
*****  TEXTURE CLASS  *****
**************************/

class Texture {

    constructor(pos, size, fillColor, lineWidth, lineColor) {
        this.pos = pos;
        this.size = size;
        this.fillColor = fillColor;
        this.lineColor = lineColor;
        this.lineWidth = lineWidth;
        this.rect = new Rectangle(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }

    SetSize(size) {
        this.size = size;
    };

    SetColor(color) {
        this.fillColor = color;
    };

    SetBorder(color, size) {
        this.lineColor = color;
        this.lineWidth = (typeof size === 'undefined') ? this.lineWidth : size;
    };

    GetPosition() {
        return this.pos;
    }

    GetSize() {
        return this.size;
    }

    GetRect() {
        return this.rect;
    }

    Update(pos) {
        this.pos = pos;
        this.rect.Update(this.pos);
    };

    Draw() {
        CONTEXT.save();
        CONTEXT.beginPath();
        CONTEXT.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        CONTEXT.fillStyle = this.fillColor;
        CONTEXT.fill();
        CONTEXT.lineWidth = this.lineWidth;
        CONTEXT.strokeStyle = this.lineColor;
        CONTEXT.stroke();
        CONTEXT.closePath();
        CONTEXT.restore();
    };

}