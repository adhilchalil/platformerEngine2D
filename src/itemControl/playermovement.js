export function playerMovement(items, playerItemData, playerControls, playerSettings, playerStates, environmentStates, DOMplayerCharacter, playerCharacterImage, timeInterval, currentTime) {

    let maxXVelocity = playerSettings.maxXVelocity;
    let playerAcceleration = playerSettings.playerAcceleration;
    let jumpVelocity = playerSettings.jumpVelocity;
    let dashVelocity = playerSettings.dashVelocity;
    let gravityAcceleration = environmentStates.gravityAcceleration;

    let currentXVelocity = playerItemData.XVelocity;

    let jumpAllowedDeadline = new Date(playerStates.lastJumpableCollisionTime.getTime() + (playerSettings.minJumpDeadline*timeInterval));

    if(jumpAllowedDeadline < currentTime){
      playerStates.jumpAvailable = false;
      playerStates.lastjumpableCollisionAngle = Math.PI/2;
    }

    //Jump movement
    if(playerControls.Space && (playerStates.jumpAvailable)){
      playerStates.jumpAvailable = false;
      playerItemData.YCordinate = playerItemData.YCordinate + 1;
      playerItemData.YVelocity = (playerControls.ArrowDown? 1.2 : 1) * jumpVelocity;
    }
    if(playerItemData.type == "ball"
      && (DOMplayerCharacter.offsetHeight <= 2*playerItemData.ballradius || DOMplayerCharacter.offsetWidth <= 1.7*playerItemData.ballradius)
      && currentTime >= playerStates.nextDashTime){
      DOMplayerCharacter.style.height = playerItemData.ballradius*2 + "px";
      DOMplayerCharacter.style.width = playerItemData.ballradius*2 + "px";
      playerCharacterImage.style.height = playerItemData.ballradius*2 + "px";
      playerCharacterImage.style.width = playerItemData.ballradius*2 + "px";
    }

    //dash movement. shift + directional
    if(playerControls.Shift && playerStates.dashCount > 0 && playerStates.nextDashTime <= currentTime){
      // playerItemData.YCordinate = playerItemData.YCordinate + 1;
      --playerStates.dashCount;
      playerStates.jumpAvailable = false;
      playerStates.nextDashTime = new Date(currentTime.getTime() + playerSettings.minDashDelay*timeInterval);
      if(playerControls.ArrowLeft && playerControls.ArrowUp){
        playerItemData.YVelocity = 0.7 * dashVelocity;
        playerItemData.XVelocity = -0.7 * dashVelocity;
      }
      else if(playerControls.ArrowRight && playerControls.ArrowUp){
        playerItemData.YVelocity = 0.7 * dashVelocity;
        playerItemData.XVelocity = 0.7 * dashVelocity;
      }
      else if(playerControls.ArrowRight && playerControls.ArrowDown){
        playerItemData.YVelocity = -0.7 * dashVelocity;
        playerItemData.XVelocity = 0.7 * dashVelocity;
      }
      else if(playerControls.ArrowLeft && playerControls.ArrowDown){
        playerItemData.YVelocity = -0.7 * dashVelocity;
        playerItemData.XVelocity = -0.7 * dashVelocity;
      }
      else if(playerControls.ArrowUp){
        DOMplayerCharacter.style.height = playerItemData.ballradius*2 + "px";
        playerCharacterImage.style.height = playerItemData.ballradius*2 + "px";
        playerItemData.YVelocity = dashVelocity;
        playerItemData.XVelocity = 0;
      }
      else if(playerControls.ArrowLeft){
        DOMplayerCharacter.style.width = playerItemData.ballradius*1.9 + "px";
        playerItemData.XVelocity = -dashVelocity;
        playerItemData.YVelocity = 0;
      }
      else if(playerControls.ArrowRight){
        DOMplayerCharacter.style.width = playerItemData.ballradius*1.9 + "px";
        playerItemData.XVelocity = dashVelocity;
        playerItemData.YVelocity = 0;
      }
      else if(playerControls.ArrowDown){
        DOMplayerCharacter.style.width = playerItemData.ballradius*1.9 + "px";
        playerItemData.YVelocity = -dashVelocity;
        playerItemData.XVelocity = 0;
      }
      else{
        playerItemData.XVelocity =  (playerStates.lastMoveIsRight? 1 : -1)*dashVelocity;
        playerItemData.YVelocity = 0;
      }
    }

    //ArrowKey Movements. directional
    if(playerItemData.XVelocity > -maxXVelocity  && playerControls.ArrowLeft){
      if(![...DOMplayerCharacter.classList].includes("imgflip")){
        DOMplayerCharacter.classList.add("imgflip")
      };
      
      let Xacceleration = -playerAcceleration*Math.cos(playerStates.lastjumpableCollisionAngle - Math.PI/2);

      playerItemData.XVelocity += Xacceleration;
      let YDirectionalVelocity = playerStates.lastjumpableCollisionAngle > Math.PI/2? 0 : 1;
      if(playerStates.jumpAvailable && YDirectionalVelocity){
        let Yacceleration = gravityAcceleration + playerAcceleration*Math.sin(playerStates.lastjumpableCollisionAngle + Math.PI/2);
        playerItemData.YVelocity += Yacceleration;
      }
    }

    if(playerItemData.XVelocity < maxXVelocity && playerControls.ArrowRight){
      if([...DOMplayerCharacter.classList].includes("imgflip")){
        DOMplayerCharacter.classList.remove("imgflip");
      };
      let Xacceleration = playerAcceleration*Math.cos(playerStates.lastjumpableCollisionAngle - Math.PI/2);
      playerItemData.XVelocity += Xacceleration;
      let YDirectionalVelocity = playerStates.lastjumpableCollisionAngle > Math.PI/2? 1 : 0;
      if(playerStates.jumpAvailable && YDirectionalVelocity){
        let Yacceleration = gravityAcceleration + YDirectionalVelocity*playerAcceleration*Math.sin(playerStates.lastjumpableCollisionAngle - Math.PI/2);
        playerItemData.YVelocity += Yacceleration;
      }
    }

    if(!playerItemData.gravity) {
      if(playerItemData.YVelocity > -maxXVelocity && playerControls.ArrowDown)
        playerItemData.YVelocity -= playerAcceleration;
  
      if(playerItemData.YVelocity < maxXVelocity && playerControls.ArrowUp)
        playerItemData.YVelocity += playerAcceleration;
    }

    if(DOMplayerCharacter.offsetHeight >= playerItemData.ballradius*1.7
      && playerControls.ArrowDown) {
      DOMplayerCharacter.style.height = playerItemData.ballradius*1.8 + "px";
      playerCharacterImage.style.height = playerItemData.ballradius*1.8 + "px";
    }
    else if(DOMplayerCharacter.offsetHeight <= playerItemData.ballradius*1.7 && !playerControls.ArrowDown){
      DOMplayerCharacter.style.height = playerItemData.ballradius*2 + "px";
      playerCharacterImage.style.height = playerItemData.ballradius*2 + "px";
    }
}

export function playerControlsManager(playerControls, playerStates, playerInputHistory, ) {
  window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }

    let time = new Date();

    switch (event.key) {
      case " ":
        playerControls.Space = true;
        break;
      case "ArrowUp" || "W":
        playerControls.ArrowUp = true;
        playerInputHistory.lastUp = time;
        break;
      case "ArrowLeft":
        playerControls.ArrowLeft = true;
        playerInputHistory.lastLeft = time;
        break;
      case "ArrowRight":
        playerControls.ArrowRight = true;
        playerInputHistory.lastRight = time;
        break;
      case "ArrowDown":
        playerControls.ArrowDown = true;
        playerInputHistory.lastDown = time;
        break;
      case "Shift":
        playerControls.Shift = true;
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }
  
    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  }, true);
  window.addEventListener("keyup", function (event) {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
  
    switch (event.key) {
      case " ":
        playerControls.Space = false;
        break;
      case "ArrowUp":
        playerControls.ArrowUp = false;
        break;
      case "ArrowLeft":
        playerControls.ArrowLeft = false;
        break;
      case "ArrowRight":
        playerControls.ArrowRight = false;
        break;
      case "ArrowDown":
        playerControls.ArrowDown = false;
        break;
      case "Shift":
        playerControls.Shift = false;
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }
  
    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  }, true);
}