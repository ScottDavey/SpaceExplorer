/*************************
*****  CIRCLE CLASS  *****
*************************/
class Circle {

    constructor(center, radius, lineColor, fillColor) {
        this.center = center;
        this.radius = radius;
        this.lineColor = lineColor;
        this.fillColor = fillColor;
    }

    GetCenter() {
        return this.center;
    }

    GetRadius() {
        return this.radius;
    }

    SetRadius(radius) {
        this.radius = radius;
    }

    SetCenter(center) {
        this.center = center;
    }

    Update(center) {
        this.center = center;
    }

    Draw() {
        CONTEXT.save();
        CONTEXT.beginPath();
        CONTEXT.lineWidth = 1;
        CONTEXT.strokeStyle = this.lineColor;
        CONTEXT.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        CONTEXT.fillStyle = this.fillColor;
        CONTEXT.fill();
        CONTEXT.stroke();
        CONTEXT.restore();
    }

}