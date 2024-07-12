export default function gravityAndVelocityDecay(items, playerControls, playerSettings, playerStates, environmentStates, currentTIme) {
    let ItemWithGravityIndex = 0;

    const groundHeight = environmentStates.groundHeight;

    items.forEach((item, index) => {
       
        let posx = item.XCordinate;
        let posy = item.YCordinate;
        let itemDiameter = item.ballradius * 2;
        let rightWall = environmentStates.roomWidth-itemDiameter;
        let topWall = environmentStates.roomHeight-itemDiameter;
       
        let elasticity = item.elasticity;
        let XVelocityDecay = playerSettings.XVelocityDecay;
        let gravityAcceleration = environmentStates.gravityAcceleration;
        
        if(!item.gravity){
            gravityAcceleration = 0;
        }
        if(item.rigid) {
            gravityAcceleration = 0;
            item.XVelocity = 0;
            item.YVelocity = 0;
        }
        let vx = item.XVelocity;
        let vy = item.YVelocity;
        let absoluteXVelocity = Math.abs(vx);
        let absoluteYVelocity = Math.abs(vy);
        posx += vx;
        posy += vy;

        //Boundary harcode position restriction
        if(environmentStates.restrictedBoundary) {
            if(posx >= rightWall) {
                vx = -Math.abs(elasticity*vx);
            }
            if(posx <= 0){
                vx = Math.abs(elasticity*vx);
            }
            if (posy <= groundHeight) {
                if(vy == 0){
    
                }
                vy = Math.abs(elasticity*vy);
                if(!item.isPlayer){
                    vx = absoluteXVelocity >= environmentStates.itemsMinimumVelocity? vx*elasticity:0;
                }
                else{
                    vx = absoluteXVelocity > playerSettings.minimumGroundVelocity? vx : 0;
                }    
            }
            if(posy >= topWall){
                vy = -Math.abs(elasticity*vy);
            }

            if(posy <= groundHeight) posy = groundHeight;
            else if(posy >= environmentStates.roomHeight-itemDiameter) posy = environmentStates.roomHeight-itemDiameter;
            if(posx >= environmentStates.roomWidth-itemDiameter) posx = environmentStates.roomWidth-itemDiameter;
            else if(posx <= 0) posx = 0;
    
        }
        else {
            if(posy <= 0) posy = environmentStates.roomHeight+itemDiameter;
            else if(posy >= environmentStates.roomHeight+itemDiameter) posy = 0;
            if(posx >= environmentStates.roomWidth+itemDiameter) posx = 0;
            else if(posx <= 0) posx = environmentStates.roomWidth+itemDiameter;
        }

        //Gravity and vertical damping
        if(posy <= groundHeight + 2){
            if(absoluteYVelocity <= gravityAcceleration){
                vy = 0;
                posy = groundHeight;
            }
            playerStates.jumpAvailable = true;
        }
        else {
            vy = vy < -environmentStates.maxYVelocity? -environmentStates.maxYVelocity : vy - gravityAcceleration;
        }

        item.XCordinate = posx;
        item.YCordinate = posy;

        let ActualXVelocityDecay = 0;
        let ActualYVelocityDecay = 0;
        if(item.isPlayer){
            ActualXVelocityDecay = (!(playerControls.ArrowLeft || playerControls.ArrowRight)?XVelocityDecay:0) +
            (absoluteXVelocity > playerSettings.maxXVelocity? absoluteXVelocity*0.01:0);
        }
        else{
            ActualXVelocityDecay = posy <= groundHeight && absoluteYVelocity == 0? XVelocityDecay : 0;
        }

        item.XVelocity = absoluteXVelocity > XVelocityDecay?
            (Math.sign(vx))*(absoluteXVelocity - ActualXVelocityDecay)
            :0;
        
        item.YVelocity = vy;

        if(!item.gravity && item.isPlayer){
            ActualYVelocityDecay =  (!(playerControls.ArrowDown || playerControls.ArrowUp)? XVelocityDecay : 0) +
            (absoluteYVelocity > playerSettings.maxXVelocity? absoluteYVelocity*0.01:0);
            item.YVelocity = absoluteYVelocity > XVelocityDecay?
                (Math.sign(vy))*(absoluteYVelocity - ActualYVelocityDecay)
                :0;
        }

        ++ItemWithGravityIndex;
    })
}