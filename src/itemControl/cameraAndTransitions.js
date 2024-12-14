export function cameraAndTransitions(initialFrame, levelProperties, playerItem, playerControls, playerInputHistory, cameraFrame, roomWidth, roomHeight, currentTime) {
    let XCameraPosition = cameraFrame.scrollLeft;
    let YCameraPosition = cameraFrame.scrollTop;

    let expectedXCameraPosition = XCameraPosition;
    let expectedYCameraPosition = YCameraPosition;

    let playerPositionRatioX = 0.4;
    let playerPositionRatioY = 0.5;
    let inversePlayerPositionRatioX = 1 - playerPositionRatioX;
    let inversePlayerPositionRatioY = 1 - playerPositionRatioY;

    /*Horizontal Direction Camera Movement Control*/
    if(levelProperties.width > roomWidth){
        if(playerItem.XCordinate < playerPositionRatioX*roomWidth && XCameraPosition > 0){
            expectedXCameraPosition = 0;
        }
        else if(playerItem.XCordinate > (levelProperties.width - playerPositionRatioX*roomWidth) && XCameraPosition < levelProperties.width - roomWidth){
            expectedXCameraPosition = levelProperties.width - roomWidth;
        }
        else if(playerItem.XCordinate > playerPositionRatioX*roomWidth && playerItem.XCordinate < (levelProperties.width - playerPositionRatioX*roomWidth)){
            if(playerItem.XVelocity > 0.1) {
                expectedXCameraPosition = playerItem.XCordinate - playerPositionRatioX*roomWidth;
            }
            else if(playerItem.XVelocity < -0.1) {
                expectedXCameraPosition =  playerItem.XCordinate - inversePlayerPositionRatioX*roomWidth;
            }
        }
    }


    /*Vertical Direction Camera Movement Control*/
    if(levelProperties.height > roomHeight){
        if(playerItem.YCordinate < playerPositionRatioY*roomHeight && YCameraPosition < (levelProperties.height - roomHeight)){
            expectedYCameraPosition = levelProperties.height - (roomHeight + 5);
        }
        else if(playerItem.YCordinate > (levelProperties.height - playerPositionRatioY*roomHeight) && YCameraPosition > 0){
            expectedYCameraPosition = 0;
        }
        else if(playerItem.YCordinate > playerPositionRatioY*roomHeight && playerItem.YCordinate < (levelProperties.height - playerPositionRatioY*roomHeight)){
            if(playerItem.YVelocity > 0.1){
                expectedYCameraPosition = (levelProperties.height - playerItem.YCordinate) - inversePlayerPositionRatioY*roomHeight;
            }
            else if(playerItem.YVelocity < -0.1) {
                expectedYCameraPosition = (levelProperties.height - playerItem.YCordinate) - playerPositionRatioY*roomHeight;
            }
        }
    }

    if(initialFrame) {
        cameraFrame.scroll({
            left:  expectedXCameraPosition,
            top: expectedYCameraPosition,
            behavior: "instant"
        });
    }
    else springArmCamera(cameraFrame, XCameraPosition, YCameraPosition, expectedXCameraPosition, expectedYCameraPosition);
}


//Camera that tries to catchup to the position expected. 
function springArmCamera(cameraFrame, XCameraPosition, YCameraPosition, expectedXCameraPosition, expectedYCameraPosition){

    let springArmXAcceleration = 0.05; //velocity per pixel per frame. control at env or levelProperties later
    let springArmYAcceleration = 0.1;

    if(expectedXCameraPosition != XCameraPosition || expectedYCameraPosition != YCameraPosition){
        let XCameraSpeed = (expectedXCameraPosition - XCameraPosition)*springArmXAcceleration;
        let YCameraSpeed = (expectedYCameraPosition - YCameraPosition)*springArmYAcceleration;
        cameraFrame.scroll({
            left:  XCameraPosition + XCameraSpeed,
            top: YCameraPosition + YCameraSpeed,
            behavior: "instant"
        });
    }
}