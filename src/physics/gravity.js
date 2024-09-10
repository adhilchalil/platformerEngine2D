export default function gravityAndVelocityDecay(items, levelTransitionData, levelProperties, playerControls, playerSettings, playerStates, environmentStates, currentTime,  currentLevel, setCurrentLevel) {
    let ItemWithGravityIndex = 0;

    const groundHeight = environmentStates.groundHeight;

    items.forEach((item, index) => {
       
        let posx = item.XCordinate;
        let posy = item.YCordinate;
        let itemDiameter = item.ballradius * 2;
        let rightWall = levelProperties.width - itemDiameter;
        let topWall = levelProperties.height - itemDiameter;
       
        let elasticity = item.elasticity;
        let XVelocityDecay = playerSettings.XVelocityDecay;
        let gravityAcceleration = environmentStates.gravityAcceleration;
        
        if(!item.gravity || currentTime < playerStates.lastDashTime){
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
            else if(posy >= levelProperties.height-itemDiameter) posy = levelProperties.height-itemDiameter;
            if(posx >= levelProperties.width - itemDiameter) posx = levelProperties.width - itemDiameter;
            else if(posx <= 0) posx = 0;
        }
        else {
            if(posy <= (-itemDiameter + 2)  && vy < 0){
                if(levelTransitionData.down){
                    console.log("levelto",items,levelTransitionData);
                    setCurrentLevel(levelTransitionData.down);
                    posy = (levelProperties.down.height? levelProperties.down.height: environmentStates.roomHeight) - itemDiameter + 2;
                }
            }
            else if(posy > (levelProperties.height) && vy > 0){
                if(levelTransitionData.up){
                    console.log("levelto",items,levelTransitionData);
                    setCurrentLevel(levelTransitionData.up);
                    posy = 0;
                }
            }
            if(posx > (levelProperties.width - itemDiameter - 2) && vx > 0) {
                if(levelTransitionData.right){
                    console.log("levelto",items,levelTransitionData);
                    setCurrentLevel(levelTransitionData.right);
                    posx = 0;
                }
            }
            else if(posx <= 2 && vx < 0) {
                if(levelTransitionData.left){
                    console.log("levelto",items,levelTransitionData, levelProperties)
                    setCurrentLevel(levelTransitionData.left);
                    posx = (levelProperties.left.width? levelProperties.left.width: environmentStates.roomWidth)   - itemDiameter - 2;
                }
            }
        }

        //Gravity and vertical damping
        vy = vy < -environmentStates.maxYVelocity? -environmentStates.maxYVelocity : vy - gravityAcceleration;

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