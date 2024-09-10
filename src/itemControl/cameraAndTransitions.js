export function cameraAndTransitions(levelProperties, playerItem, cameraFrame, roomWidth, roomHeight) {
    let XCameraPosition = cameraFrame.scrollLeft;
    let YCameraPosition = cameraFrame.scrollTop;

    /*Horizontal Direction Camera Movement Control*/
    if(levelProperties.width > roomWidth){
        if(playerItem.XCordinate < 0.2*levelProperties.width && XCameraPosition > 0){
            console.log('uhm')
            cameraFrame.scroll({left: 0, behavior: "instant"});
        }
        else if(playerItem.XCordinate > 0.8*levelProperties.width && XCameraPosition < levelProperties.width - roomWidth){
            cameraFrame.scroll({left: levelProperties.width - roomWidth, behavior: "instant"});
        }
        else if(playerItem.XCordinate > 0.2*levelProperties.width && playerItem.XCordinate < 0.8*levelProperties.width){
            // if(playerItem.XVelocity > 0.2){
                cameraFrame.scroll({left: playerItem.XCordinate - 0.2*levelProperties.width});
            // }
            // else if(playerItem.XVelocity < -0.2) {
            //     cameraFrame.scroll({left: playerItem.XCordinate - 0.8*levelProperties.width});
            // }
        }
    }


    /*Vertical Direction Camera Movement Control*/
    if(levelProperties.height > roomHeight){
        if(playerItem.YCordinate < 0.2*levelProperties.height && YCameraPosition < (levelProperties.height - roomHeight)){
            cameraFrame.scroll({top: levelProperties.height - roomHeight, behavior: "instant"});
        }
        else if(playerItem.YCordinate > 0.8*levelProperties.height && YCameraPosition > 0){
            cameraFrame.scroll({top: 0, behavior: "instant"});
        }
        else if(playerItem.YCordinate > 0.2*levelProperties.height && playerItem.YCordinate < 0.8*levelProperties.height){
            // if(playerItem.YVelocity > 0.2){
                cameraFrame.scroll({top: 0.8*levelProperties.height - playerItem.YCordinate});
            // }
            // else if(playerItem.XVelocity < -0.2) {
            //     cameraFrame.scroll({top: playerItem.YCordinate - 0.2*levelProperties.height});
            // }
        }
    }
}