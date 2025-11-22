/****************************
*****  RECTANGLE CLASS  *****
****************************/
class Rectangle {

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.left = this.x;
        this.top = this.y;
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
        this.center = new Vector2((this.x + (this.width / 2)), (this.y + (this.height / 2)));
        this.halfSize = new Vector2((this.width / 2), (this.height / 2));
    }

    GetIntersectionDepth(rect) {
        const distanceX = this.center.x - rect.center.x;
        const distanceY = this.center.y - rect.center.y;
        const minDistanceX = this.halfSize.x + rect.halfSize.x;
        const minDistanceY = this.halfSize.y + rect.halfSize.y;

        // If we are not intersecting, return (0, 0)
        if (Math.abs(distanceX) >= minDistanceX || Math.abs(distanceY) >= minDistanceY)
            return new Vector2(0, 0);

        // Calculate and return intersection depths
        const depthX = distanceX > 0 ? minDistanceX - distanceX : -minDistanceX - distanceX;
        const depthY = distanceY > 0 ? minDistanceY - distanceY : -minDistanceY - distanceY;

        return new Vector2(depthX, depthY);
    }

    SetSize(size) {
        this.width = size.x;
        this.height = size.y;
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
        this.center = new Vector2((this.x + (this.width / 2)), (this.y + (this.height / 2)));
        this.halfSize = new Vector2((this.width / 2), (this.height / 2));
    }

    Update(pos) {
        this.x = pos.x;
        this.y = pos.y;
        this.left = this.x;
        this.top = this.y;
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
        this.center = new Vector2((this.x + (this.width / 2)), (this.y + (this.height / 2)));
    }

}