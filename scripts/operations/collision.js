/**********************************************
**************  COLLISION CLASS  **************
**********************************************/

class Collision {

    constructor(collisionData = []) {
        this.collisionData = collisionData;
        this.lines = [];
        
        this.Initialize();
    }

    Initialize() {
        this.lines = this.collisionData.map(collision => {
            return new Line(
                new Vector2(collision.sx, collision.sy),    // Start position vector
                new Vector2(collision.ex, collision.ey),    // End position vector
                collision.h,                                // Line color
                collision.c,                                // Collision type (FLOOR, WALL, CEILING)
                collision.n,                                // Line Normal (which way to push the entity)
                collision.s,                                // Line Sound (when collided with)
                collision.sl,                               // Slope (or, the m in y = mx + b)
                collision.b                                 // Y Intercept (or, the b in y = mx + b)
            );
        });

        this.collisionData = [];
    }

    GetLineYCollisionFromPosition(position) {
        const possibleLines = this.lines.filter(line => {
            return (position.x > line.startPos.x && position.x < line.endPos.x && line.collision === 'FLOOR');
        });

        // Get the y-Intercept of each line
        const yIntercepts = possibleLines.map(line => { return (line.slope * position.x + line.b); });
        
        // Default to the first yIntercept.
        let yPosition = yIntercepts[0];
        
        // If there's more than 1 line, loop over the yIntercepts and choose the closest one
        if (yIntercepts.length > 1) {
            for (const y of yIntercepts) {
                // If the y of the line intercept is beneath the given position,
                //  and if the y is less than the previously selected y position
                if (y > position.y && y < yPosition) {
                    yPosition = y;
                }
            }
        }
        
        return yPosition;

    }

    CheckLOS(ray) {
        const rayPos = ray.GetPos();
        const segmentSize = 5;
        const segmentHalfSize = segmentSize / 2;
        const xLen = Math.abs(rayPos.start.x - rayPos.end.x);
		const yLen = Math.abs(rayPos.start.y - rayPos.end.y);
		const greaterLength = xLen > yLen ? xLen : yLen;
		const isGreaterLengthX = xLen > yLen;
		const segments = greaterLength / segmentSize;
		const lineDirX = rayPos.start.x > rayPos.end.x ? -1 : 1;
		const lineDirY = rayPos.start.y > rayPos.end.y ? -1 : 1;

        let isColliding = false;

        /*
            In this function, we're going to take in a ray (line) that's
            shooting from the enemy to the player.

            Every frame, make a series of rectangles that go from the line's
            start to it's end and check to see if any of those collide with
            an environment collision line. If so, the enemy does not see the
            player.

                                   WALL
            rect:    [ ][ ][ ][ ][x]|
            ray:   E --------------------- P
                                   |

            Note that 3 scenarios are handled:
                1.  If it's a vertical line - the x will be fixed
                2.  If X start/end has a greater width than Y start/end,
                    use mx+b to find y on the sloping line
                3.  If Y is longer, use y-b / m to find x on the sloping line
        
        */

        for (let i = 0; i <= segments; i++) {

			let x, y;

            // 1: Handle vertical lines
			if (rayPos.start.x === rayPos.end.x) {
				x = rayPos.start.x; // x is constant for vertical lines
				y = rayPos.start.y + (segmentSize * i * lineDirY);
			} else {
                const slope = (rayPos.end.y - rayPos.start.y) / (rayPos.end.x - rayPos.start.x);
		        const b = rayPos.start.y - (slope * rayPos.start.x);

                // 2: X length is greater (line is closer to horizontal)
                if (isGreaterLengthX) {
                    
                    x = (rayPos.start.x + (segmentSize * i * lineDirX));
                    y = (slope * x) + b;

                /// 3: Y is greater (line is closer to vertical)
                } else {
                    y = (rayPos.start.y + (segmentSize * i * lineDirY));
                    x = (y - b) / slope;
                }
            }

			const segmentBounds = new Rectangle(x - segmentHalfSize, y - segmentHalfSize, segmentSize, segmentSize);

            if (this.CheckLineCollisionRect(segmentBounds)) {
                isColliding = true;
                break;
            }

		}

        return isColliding;

    }

    CheckLineCollisionEntity(entity) {
        const isMovingUp = entity.velocity.y < 0;
        const bounds = entity.GetBounds();
        let isOnGround = false;
        let isHittingWall = false;

        // Lines
        for (const line of this.lines) {
            const slope = line.slope;
            const b = line.b;
            const isWithinLineX = (bounds.center.x >= line.startPos.x && bounds.center.x <= line.endPos.x);
            const isWithinLineY = (bounds.center.y >= line.startPos.y && bounds.center.y <= line.endPos.y);

            // CHECK AGAINST WALL COLLISIONS
            if (line.collision === 'WALL' && isWithinLineY) {

                const xDiff = Math.abs(bounds.center.x - line.startPos.x);

                if (xDiff <= bounds.halfSize.x) {
                    entity.position.x =
                        line.normal < 0
                            ? line.startPos.x - bounds.width
                            : line.startPos.x;
                    entity.velocity.x = 0;
                    isHittingWall = true;
                }

            }
            
            // FLOOR AND CEILING COLLISION
            if ((line.collision === 'FLOOR' || line.collision === 'CEILING') && isWithinLineX) {

                let y = slope * bounds.center.x + b;

                // FLOOR
                if (line.collision === 'FLOOR' && !isMovingUp) {

                    // If the bottom of the player is less than 15 pixels below the line, shoot him back up
                    if (Math.abs(y - bounds.bottom) <= 15) {
                        y = Math.floor(y);
                        entity.position.y = y - bounds.height;

                        entity.velocity.y = 0;
                        isOnGround = true;
                        entity.SetGroundType(line.sound);
                    }

                }

                // CEILING
                if (line.collision === 'CEILING' && isMovingUp) {
                    
                    if (Math.abs(y - bounds.top) <= 10) {
                        y = Math.floor(y);
                        entity.position.y = y + 5;  // Hack to solve a problem with a certain slant of ceiling
                        entity.velocity.y = 0;
                    }
                }

            }
        }

        // Coyote time (for late jumps)
        //  If the entity was on the ground before this function was called, and is now not on the ground
        //  set variables to track that it was on the ground, and the timestamp.
        if (entity.isOnGround && !isOnGround && !entity.wasOnGround) {
            entity.wasOnGround = true;
            entity.lastGroundTime = GameTime.getCurrentGameTime();
        }

        if (isOnGround) {
            entity.wasOnGround = false;
            entity.lastGroundTime = 0;
        }

        entity.isOnGround = isOnGround;
        entity.isHittingWall = isHittingWall;
    }

    CheckLineCollisionRect(rectBounds, returnGroundType = false) {

        for (const line of this.lines) {
            const slope = line.slope;
            const b = line.b;
            const yc = (slope * rectBounds.center.x) + b;

            if ((line.collision == 'FLOOR' || line.collision == 'CEILING') && rectBounds.center.x >= line.startPos.x && rectBounds.center.x <= line.endPos.x) {

                if (Math.abs(yc - rectBounds.center.y) <= rectBounds.halfSize.y + 5) {
                    return returnGroundType ? line.sound : true;
                }

            } else if (line.collision == 'WALL' && rectBounds.center.y > line.startPos.y && rectBounds.center.y < line.endPos.y) {

                const xDiff = Math.abs(rectBounds.center.x - line.startPos.x);
                if (xDiff <= rectBounds.halfSize.x + 5) {
                    return true;
                }

            }
        }

        return false;
    }

    CheckBoxCollision(box1, box2) {
        
        const intersectionDepth = box1.GetIntersectionDepth(box2);

        if (intersectionDepth.x !== 0 && intersectionDepth.y !== 0) {
            const absDepthX = Math.abs(intersectionDepth.x);
            const absDepthY = Math.abs(intersectionDepth.y);

            if (absDepthY < absDepthX || absDepthX < absDepthY) {
                return true;
            }
        }

        return false;

    }

    CheckBoxToRadius(box, circle) {
        const distanceX = box.center.x - circle.GetCenter().x;
        const distanceY = box.center.y - circle.GetCenter().y;
        const minDistanceX = box.halfSize.x + circle.GetRadius();
        const minDistanceY = box.halfSize.y + circle.GetRadius();

        // If we are not intersecting, return false
        if (Math.abs(distanceX) >= minDistanceX || Math.abs(distanceY) >= minDistanceY) {
            return false;
        }

        const depthX = distanceX > 0 ? minDistanceX - distanceX : -minDistanceX - distanceX;
        const depthY = distanceY > 0 ? minDistanceY - distanceY : -minDistanceY - distanceY;

        if (Math.abs(depthY) < Math.abs(depthX) || Math.abs(depthX) < Math.abs(depthY)) {
            return true;
        }

        return false;

    }

    DrawCollisionLines(cameraPos) {
        for (const line of this.lines) {
            const linePos = line.GetPos();
            // Only render if the lines are visible.
            if ((linePos.start.x > cameraPos.x && linePos.start.x < (cameraPos.x + CANVAS_WIDTH)) || (linePos.end.x > cameraPos.x && linePos.end.x < (cameraPos.x + CANVAS_WIDTH))) {
                line.Draw();
            }
        }
    }


}