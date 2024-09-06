const Pi = Math.PI;

const jumpResetAngleLeft = Number(process.env.NEXT_PUBLIC_PLAYER_JUMPRESET_ANGLE_LEFT);
const jumpResetAngleRight = Number(process.env.NEXT_PUBLIC_PLAYER_JUMPRESET_ANGLE_RIGHT);
const dashResetAngleLeft = Number(process.env.NEXT_PUBLIC_PLAYER_DASHRESET_ANGLE_LEFT);
const dashResetAngleRight = Number(process.env.NEXT_PUBLIC_PLAYER_DASHRESET_ANGLE_RIGHT);
const DashResetCollisionAngleRange = [jumpResetAngleRight*(Pi/180),jumpResetAngleLeft*(Pi/180)];
const JumpResetCollisionAngleRange = [dashResetAngleRight*(Pi/180),dashResetAngleLeft*(Pi/180)];

export default function collision(items, playerStates, playerSettings, coordinateCheck, environmentStates, currentTime, playerDeathHandler) {
    
    items.forEach((item1,index1) => {
        items.forEach((item2,index2) => {
            // If both items are RIGID(collides but does not react to collisions) no collision can happen
            if(index2 > index1 && !(item1.rigid && item2.rigid)){

                let collisionAngle = NaN;

                //Ball to Ball Collision
                if(item1.type == "ball" && item2.type == "ball") {
                    let item1CenterX = item1.XCordinate + item1.ballradius;
                    let item2CenterX = item2.XCordinate + item2.ballradius;
                    let item1CenterY = item1.YCordinate + item1.ballradius;
                    let item2CenterY = item2.YCordinate + item2.ballradius;

                    let collisionDistance = item1.ballradius + item2.ballradius;

                    let verticalDistance = (item1CenterY - item2CenterY);
                    let horizontalDistance = (item1CenterX - item2CenterX);
                    
                    if(verticalDistance > collisionDistance || horizontalDistance > collisionDistance)
                        return;
                    
                    let totalDistance = rootOfSquares([verticalDistance, horizontalDistance]);
                    
                    if( totalDistance < collisionDistance && !(item1.rigid && item2.rigid)) {

                        if((item1.isPlayer || item2.isPlayer) && (item1.deathZone || item2.deathZone)){
                            console.log("death");
                            playerDeathHandler();
                        }

                        let ballRadiusRatio = item1.ballradius/(collisionDistance);

                        collisionAngle = horizontalDistance > 0? Math.asin(verticalDistance/totalDistance): Pi - Math.asin(verticalDistance/totalDistance);

                        let avgElasticity = ((item1.elasticity == undefined? 1 : item1.elasticity) + (item2.elasticity == undefined? 1 : item2.elasticity))/2;
                        
                        let overlappingDistance = ((item1.ballradius + item2.ballradius) - totalDistance) + 1;

                        overLapCorrection(item1, item2, overlappingDistance, horizontalDistance, verticalDistance, totalDistance, ballRadiusRatio);

                        if(item1.isPlayer) {
                            playerMovementResets(collisionAngle, playerStates, playerSettings, currentTime);
                        }
                        
                        else if(item2.isPlayer) {
                            playerMovementResets((Pi + collisionAngle)%Pi, playerStates, playerSettings, currentTime);
                        }

                        collisionVelocityExchange(item1, item2, collisionAngle, playerStates, environmentStates, avgElasticity);
                    }
                }
                
                //Ball to Box Collision
                if(
                    (item1.type == "ball" && item2.type == "box") ||
                    (item2.type == "ball" && item1.type == "box")
                ) {
                    let box = item1.type == "box"? item1: item2;
                    let ball = item1.type == "ball"? item1: item2;

                    let ballCentreX = ball.XCordinate + ball.ballradius;
                    let ballCentreY = ball.YCordinate + ball.ballradius;

                    let tiltInRadians = box.tilt? box.tilt * (Pi/180) : 0;

                    let corner1 = [0,0];
                    let corner2 = [0,0];
                    let corner3 = [0,0];
                    let corner4 = [0,0];

                    if(box.corner1 && box.rigid && !box.moving) {
                        corner1 = box.corner1;
                        corner2 = box.corner2;
                        corner3 = box.corner3;
                        corner4 = box.corner4;
                    }
                    else if(box.rigid && !box.moving){
                        // Box corners clockwise from bottom-left before tilting.
                        corner1 = [box.XCordinate, box.YCordinate];
                        corner2 = [box.XCordinate + Math.cos(Pi/2 + tiltInRadians)*box.height, box.YCordinate + Math.sin(Pi/2 + tiltInRadians)*box.height];
                        corner3 = [corner2[0] + Math.cos(tiltInRadians)*box.width, corner2[1] + Math.sin(tiltInRadians)*box.width];
                        corner4 = [corner1[0] + Math.cos(tiltInRadians)*box.width, corner1[1] + Math.sin(tiltInRadians)*box.width];
                        box.corner1 = corner1;
                        box.corner2 = corner2;
                        box.corner3 = corner3;
                        box.corner4 = corner4;
                        // coordinateCheck.push(corner1);
                        // coordinateCheck.push(corner2);
                        // coordinateCheck.push(corner3);
                        // coordinateCheck.push(corner4);
                    }
                    else if(!box.rigid && !box.moving){
                        corner1 = [box.XCordinate, box.YCordinate];
                        corner2 = [box.XCordinate + Math.cos(Pi/2 + tiltInRadians)*box.height, box.YCordinate + Math.sin(Pi/2 + tiltInRadians)*box.height];
                        corner3 = [corner2[0] + Math.cos(tiltInRadians)*box.width, corner2[1] + Math.sin(tiltInRadians)*box.width];
                        corner4 = [corner1[0] + Math.cos(tiltInRadians)*box.width, corner1[1] + Math.sin(tiltInRadians)*box.width];
                    }

                    let alternateSideTilt = Pi/2 + tiltInRadians;

                    let distanceToBallSide1 = distanceFromLinetoPoint(ballCentreX, ballCentreY, corner1[0], corner1[1], alternateSideTilt);
                    let distanceToBallSide2 = distanceFromLinetoPoint(ballCentreX, ballCentreY, corner2[0], corner2[1], tiltInRadians);
                    let distanceToBallSide3 = distanceFromLinetoPoint(ballCentreX, ballCentreY, corner3[0], corner3[1], Pi + alternateSideTilt);
                    let distanceToBallSide4 = distanceFromLinetoPoint(ballCentreX, ballCentreY, corner4[0], corner4[1], Pi + tiltInRadians);

                    if(-distanceToBallSide1 < ball.ballradius && -distanceToBallSide2 < ball.ballradius && -distanceToBallSide3 < ball.ballradius && -distanceToBallSide4 < ball.ballradius){
                        let distanceFromEachSide = [-distanceToBallSide1,-distanceToBallSide2,-distanceToBallSide3,-distanceToBallSide4];
                        let ActualDistanceFromBox = rootOfPositiveSquares(distanceFromEachSide);
                        let overlappingDistance = ball.ballradius - ActualDistanceFromBox;
                        if(ActualDistanceFromBox < ball.ballradius){
                            if((item1.isPlayer || item2.isPlayer) && (item1.deathZone || item2.deathZone)){
                                console.log("death");
                                playerDeathHandler();
                            }
                            let index = 0;
                            let collisionSide = 0;
                            let collisionSideDistance = 0;

                            while(index < 4){
                                if(distanceFromEachSide[index] > 0){
                                    if(distanceFromEachSide[(index+1)%4] > 0){
                                        collisionSide = (index+1)%4;
                                        collisionSideDistance = distanceFromEachSide[(index+1)%4];
                                    }
                                    else{
                                        collisionSide = index;
                                        collisionSideDistance = distanceFromEachSide[index];
                                    }
                                    break;
                                }
                                index++;
                            };

                            let collisionAngleToBox = Pi - collisionSide * Pi/2;
                            collisionAngle = tiltInRadians + collisionAngleToBox + Math.acos(collisionSideDistance/ActualDistanceFromBox);
                            ball.XCordinate += overlappingDistance*Math.cos(collisionAngle);
                            ball.YCordinate += overlappingDistance*Math.sin(collisionAngle);

                            let avgElasticity = ((item1.elasticity == undefined? 1 : item1.elasticity) + (item2.elasticity == undefined? 1 : item2.elasticity))/2;

                            if(ball.isPlayer){
                                playerMovementResets(collisionAngle, playerStates, playerSettings, currentTime);
                            }
                            else if(box.isPlayer){
                                playerMovementResets((Pi + collisionAngle)%Pi, playerStates, playerSettings, currentTime);
                            }
                            
                            collisionVelocityExchange(ball, box, collisionAngle, playerStates, environmentStates, avgElasticity);
                        }
                    }
                }
            }
        })
    });
}

//Function to find perpendicular distance of point to line using a point on the line and angle of the line to x-axis.
let distanceFromLinetoPoint = (pointX, pointY, linePointX, linePointY, lineAngle) => {
    return pointX * Math.sin(lineAngle) - pointY * Math.cos(lineAngle) - linePointX * Math.sin(lineAngle) + linePointY * Math.cos(lineAngle);
}

let overLapCorrection = (item1, item2, overlappingDistance, horizontalDistance, verticalDistance, totalDistance, ballRadiusRatio) => {
    if(item1.rigid){
        item2.XCordinate += overlappingDistance*(-horizontalDistance/totalDistance);
        item2.YCordinate += overlappingDistance*(-verticalDistance/totalDistance);
    }
    else if(item2.rigid){
        item1.XCordinate += overlappingDistance*(horizontalDistance/totalDistance);
        item1.YCordinate += overlappingDistance*(verticalDistance/totalDistance);
    }
    else if(ballRadiusRatio){
        item1.XCordinate += overlappingDistance*ballRadiusRatio*(horizontalDistance/totalDistance);
        item1.YCordinate += overlappingDistance*ballRadiusRatio*(verticalDistance/totalDistance);
        item2.XCordinate += overlappingDistance*(1-ballRadiusRatio)*(-horizontalDistance/totalDistance);
        item2.YCordinate += overlappingDistance*(1-ballRadiusRatio)*(-verticalDistance/totalDistance);
    }
}

let collisionVelocityExchange = (item1, item2, collisionAngle, playerStates, environmentStates, avgElasticity) => {
    if(item1.rigid){
        let totalitem2Velocity = rootOfSquares([item2.XVelocity,item2.YVelocity]);
        
        //Converting collision to one D along collision angle axis.
        let item2AngleofIncidence = totalitem2Velocity?
            (
                item2.XVelocity >= 0?
                    Math.asin(item2.YVelocity/totalitem2Velocity)
                    : Pi - Math.asin(item2.YVelocity/totalitem2Velocity)
            )
            : 0;
        //Converting collision to one D along collision angle axis.
        let item2incidentAngletoCollision = item2AngleofIncidence - collisionAngle;
        let Item2OneDCollisionVI = Math.cos(item2incidentAngletoCollision)*totalitem2Velocity;
        let Item2NoCollisionVI = Math.sin(item2incidentAngletoCollision)*totalitem2Velocity;


        let Item2VXFinal = -Item2OneDCollisionVI * Math.cos(collisionAngle) + Item2NoCollisionVI * Math.cos(Pi/2 + collisionAngle);
        let Item2VYFinal = -Item2OneDCollisionVI * Math.sin(collisionAngle) + Item2NoCollisionVI * Math.sin(Pi/2 + collisionAngle);

        item2.XVelocity = item2.isPlayer? Item2VXFinal : item2.elasticity * Item2VXFinal;
        item2.YVelocity = Math.abs(Item2VYFinal) <= environmentStates.gravityAcceleration? 0 : item2.elasticity * Item2VYFinal;
    } 
    else if(item2.rigid){
        let totalitem1Velocity = rootOfSquares([item1.XVelocity,item1.YVelocity]);
        
        //Converting collision to one D along collision angle axis.
        let item1AngleofIncidence = totalitem1Velocity?
            (
                item1.XVelocity >= 0?
                    Math.asin(item1.YVelocity/totalitem1Velocity)
                    : Pi - Math.asin(item1.YVelocity/totalitem1Velocity)
            )
            : 0;
        //Converting collision to one D along collision angle axis.
        let item1incidentAngletoCollision = item1AngleofIncidence - collisionAngle;
        let Item1OneDCollisionVI = Math.cos(item1incidentAngletoCollision)*totalitem1Velocity;
        let Item1NoCollisionVI = Math.sin(item1incidentAngletoCollision)*totalitem1Velocity;


        let Item1VXFinal = -Item1OneDCollisionVI * Math.cos(collisionAngle) + Item1NoCollisionVI * Math.cos(Pi/2 + collisionAngle);
        let Item1VYFinal = -Item1OneDCollisionVI * Math.sin(collisionAngle) + Item1NoCollisionVI * Math.sin(Pi/2 + collisionAngle);

        item1.XVelocity = item1.isPlayer? Item1VXFinal : item1.elasticity * Item1VXFinal;
        item1.YVelocity = Math.abs(Item1VYFinal) <= environmentStates.gravityAcceleration? 0 : item1.elasticity * Item1VYFinal;
    }
    else{
        let totalitem1Velocity = rootOfSquares([item1.XVelocity,item1.YVelocity]);
        let totalitem2Velocity =rootOfSquares([item2.XVelocity,item2.YVelocity]);
        
        let item1AngleofIncidence = totalitem1Velocity?
            (
                item1.XVelocity >= 0?
                    Math.asin(item1.YVelocity/totalitem1Velocity)
                    : Pi - Math.asin(item1.YVelocity/totalitem1Velocity)
            )
            : 0;
        //Converting collision to one D along collision angle axis.
        let item1incidentAngletoCollision = item1AngleofIncidence - collisionAngle;
        let Item1OneDCollisionVI = Math.cos(item1incidentAngletoCollision)*totalitem1Velocity;
        let Item1NoCollisionVI = Math.sin(item1incidentAngletoCollision)*totalitem1Velocity;

        let item2AngleofIncidence = totalitem2Velocity?
            (
                item2.XVelocity >= 0?
                    Math.asin(item2.YVelocity/totalitem2Velocity)
                    : Pi - Math.asin(item2.YVelocity/totalitem2Velocity)
            )
            : 0;
        //Converting collision to one D along collision angle axis.
        let item2incidentAngletoCollision = item2AngleofIncidence - collisionAngle;
        let Item2OneDCollisionVI = Math.cos(item2incidentAngletoCollision)*totalitem2Velocity;
        let Item2NoCollisionVI = Math.sin(item2incidentAngletoCollision)*totalitem2Velocity;

        let Item1VXFinal = Item2OneDCollisionVI * Math.cos(collisionAngle) + Item1NoCollisionVI * Math.cos(Pi/2 + collisionAngle);
        let Item1VYFinal = Item2OneDCollisionVI * Math.sin(collisionAngle) + Item1NoCollisionVI * Math.sin(Pi/2 + collisionAngle);

        let Item2VXFinal = Item1OneDCollisionVI * Math.cos(collisionAngle) + Item2NoCollisionVI * Math.cos(Pi/2 + collisionAngle);
        let Item2VYFinal = Item1OneDCollisionVI * Math.sin(collisionAngle) + Item2NoCollisionVI * Math.sin(Pi/2 + collisionAngle);

        item1.XVelocity = item1.isPlayer? Item1VXFinal : avgElasticity * Item1VXFinal;
        item1.YVelocity = Math.abs(Item1VYFinal) <= environmentStates.gravityAcceleration? 0 : avgElasticity * Item1VYFinal;
        item2.XVelocity = item2.isPlayer? Item2VXFinal : avgElasticity * Item2VXFinal;
        item2.YVelocity = Math.abs(Item2VYFinal) <= environmentStates.gravityAcceleration? 0 : avgElasticity * Item2VYFinal;
    }
}

let rootOfPositiveSquares = (numbers) => {
    let sumOfSquares = numbers.reduce((sum , num) => {
        if(num > 0) {
            sum += num**2;
        }
        return sum;
    },0);
    return Math.sqrt(sumOfSquares);
}

let playerMovementResets = (collisionAngle, playerStates, playerSettings, currentTime) => {
    if(collisionAngle > DashResetCollisionAngleRange[0] && collisionAngle < DashResetCollisionAngleRange[1]){
        playerStates.dashCount = playerSettings.maxDashCount;
        playerStates.lastRunnableCollisionAngle = collisionAngle;
    }
    if(collisionAngle >= JumpResetCollisionAngleRange[0] && collisionAngle < JumpResetCollisionAngleRange[1]){
        playerStates.jumpAvailable = true;
        playerStates.lastJumpableCollisionTime = currentTime;
    }
}

let rootOfSquares = (numbers) => {
    let sumOfSquares = numbers.reduce((sum , num) => {
        sum += num**2;
        return sum;
    },0);
    return Math.sqrt(sumOfSquares);
}