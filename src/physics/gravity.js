export default function gravityAndVelocityDecayAndLevelTransitions(items, levelTransitionData, levelProperties, playerControls, playerSettings, playerStates, environmentStates, currentTime,  currentLevel, setCurrentLevel) {

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
        
        if(!item.gravity || (item.isPlayer && (currentTime < playerStates.nextDashTime || (playerStates.jumpAvaillable)))){
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
        let boudaryCondition = () => {
            if(posx >= rightWall) {
                vx = -Math.abs(elasticity*vx);
            }
            if(posx <= 0){
                vx = Math.abs(elasticity*vx);
            }
            if (posy <= 0) {
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

            if(posy <= 0) posy = 0;
            else if(posy >= levelProperties.height-itemDiameter) posy = levelProperties.height-itemDiameter;
            if(posx >= levelProperties.width - itemDiameter) posx = levelProperties.width - itemDiameter;
            else if(posx <= 0) posx = 0;
        };

        if(environmentStates.restrictedBoundary) {
            boudaryCondition();
        }
        else {
            if(posy <= (-itemDiameter + 2)  && vy < 0){
                if(levelTransitionData.down){
                    setCurrentLevel(levelTransitionData.down);
                    let totalOffset = (levelProperties.offsetDown? levelProperties.offsetDown : 0) - (levelProperties.down?.offsetUp? levelProperties.down.offsetUp : 0);
                    posx = posx - totalOffset;
                    posy = (levelProperties.down.height? levelProperties.down.height: environmentStates.roomHeight) - itemDiameter + 2;
                }
                else boudaryCondition()
            }
            else if(posy > (levelProperties.height) && vy > 0){
                if(levelTransitionData.up){
                    setCurrentLevel(levelTransitionData.up);
                    let totalOffset = (levelProperties.offsetUp? levelProperties.offsetUp : 0) - (levelProperties.up?.offsetDown? levelProperties.up.offsetDown : 0);
                    posx = posx - totalOffset;
                    posy = 0;
                }
                else boudaryCondition()
            }
            if(posx > (levelProperties.width - itemDiameter - 2) && vx > 0) {
                if(levelTransitionData.right){
                    setCurrentLevel(levelTransitionData.right);
                    let totalOffset = (levelProperties.offsetRight? levelProperties.offsetRight : 0) - (levelProperties.right?.offsetLeft? levelProperties.right.offsetLeft : 0);
                    posx = 0;
                    posy = posy - totalOffset;
                }
                else boudaryCondition()
            }
            else if(posx <= 2 && vx < 0) {
                if(levelTransitionData.left){
                    setCurrentLevel(levelTransitionData.left);
                    let totalOffset = (levelProperties.offsetLeft? levelProperties.offsetLeft : 0) - (levelProperties.left?.offsetRight? levelProperties.left.offsetRight : 0);
                    posx = (levelProperties.left.width? levelProperties.left.width: environmentStates.roomWidth)   - itemDiameter - 2;
                    posy = posy - totalOffset;
                }
                else boudaryCondition()
            }
        }

        //Gravity and vertical fall damping(only negative vy to be considered as fall)
        vy = vy <= -environmentStates.maxYVelocity? -environmentStates.maxYVelocity : vy - gravityAcceleration;

        item.XCordinate = posx;
        item.YCordinate = posy;

        let ActualXVelocityDecay = 0;
        let ActualYVelocityDecay = 0;
        if(absoluteXVelocity != 0 && (currentTime > playerStates.nextDashTime)){
            ActualXVelocityDecay = (!item.disableVelocityDecay && 
                (!item.isPlayer || !(playerControls.ArrowLeft || playerControls.ArrowRight))?
                XVelocityDecay:0) +
            (absoluteXVelocity > playerSettings.maxXVelocity? absoluteXVelocity*0.01:0);
        }

        item.XVelocity = absoluteXVelocity > XVelocityDecay?
            (Math.sign(vx))*(absoluteXVelocity - ActualXVelocityDecay)
            :0;
        
        item.YVelocity = vy;

        if(!item.gravity && item.isPlayer){
            ActualYVelocityDecay =  (!(playerControls.ArrowDown || playerControls.ArrowUp)? XVelocityDecay : 0) +
            (absoluteYVelocity > playerSettings.maxXVelocity? absoluteYVelocity*0.01:0);
            item.YVelocity = absoluteYVelocity > XVelocityDecay? (Math.sign(vy))*(absoluteYVelocity - ActualYVelocityDecay) : 0;
        }
    })
}