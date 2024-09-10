export function playerMovement(items, playerItemData, playerControls, playerSettings, playerStates, groundHeight, DOMplayerCharacter, playerCharacterImage, timeInterval, currentTime) {

    let maxXVelocity = playerSettings.maxXVelocity;
    let playerAcceleration = playerSettings.playerAcceleration;
    let jumpVelocity = playerSettings.jumpVelocity;
    let dashVelocity = playerSettings.dashVelocity;

    let currentXVelocity = playerItemData.XVelocity;
    let jumpAllowedDeadline = new Date(playerStates.lastJumpableCollisionTime.getTime() + playerSettings.minJumpDeadline*(timeInterval/10));

    if(jumpAllowedDeadline < currentTime){
      playerStates.jumpAvailable = false;
      playerStates.lastRunnableCollisionAngle = Math.PI/2;
    }

    if(playerItemData.YCordinate < groundHeight + 5){
      playerStates.dashCount = playerSettings.maxDashCount;
      playerStates.jumpAvailable = true;
    }

    //Jump movement
    if(playerControls.Space && (playerStates.jumpAvailable || playerItemData.YCordinate < (groundHeight + 5))){
        playerItemData.YCordinate = playerItemData.YCordinate + 1;
        playerItemData.YVelocity = (playerControls.ArrowDown? 1.2 : 1) * jumpVelocity;
        playerStates.jumpAvailable = false;
    }
    if(playerItemData.type == "ball"
      && (DOMplayerCharacter.offsetHeight <= 2*playerItemData.ballradius || DOMplayerCharacter.offsetWidth <= 1.7*playerItemData.ballradius)
      && currentTime >= playerStates.lastDashTime){
      DOMplayerCharacter.style.height = playerItemData.ballradius*2 + "px";
      DOMplayerCharacter.style.width = playerItemData.ballradius*2 + "px";
      playerCharacterImage.style.height = playerItemData.ballradius*2 + "px";
      playerCharacterImage.style.width = playerItemData.ballradius*2 + "px";
    }

    //dash movement. shift + directional
    if(playerControls.Shift && playerStates.dashCount > 0 && playerStates.lastDashTime <= currentTime){
      playerItemData.YCordinate = playerItemData.YCordinate + 1;
      --playerStates.dashCount;
      playerStates.jumpAvailable = false;
      playerStates.lastDashTime = new Date(currentTime.getTime() + playerSettings.minDashDelay*(timeInterval/10));
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
      let Xacceleration = -playerAcceleration*Math.cos(playerStates.lastRunnableCollisionAngle - Math.PI/2);
      playerItemData.XVelocity += Xacceleration;
      let YDirectionalVelocity = playerStates.lastRunnableCollisionAngle > Math.PI/2? 0 : 1;
      let Yacceleration = YDirectionalVelocity*playerAcceleration*0.5 + YDirectionalVelocity*playerAcceleration*Math.cos(playerStates.lastRunnableCollisionAngle);
      playerItemData.YVelocity += Yacceleration;
    }

    if(playerItemData.XVelocity < maxXVelocity && playerControls.ArrowRight){
      if([...DOMplayerCharacter.classList].includes("imgflip")){
        DOMplayerCharacter.classList.remove("imgflip");
      };
      let Xacceleration = playerAcceleration*Math.cos(playerStates.lastRunnableCollisionAngle - Math.PI/2);
      playerItemData.XVelocity += Xacceleration;
      let YDirectionalVelocity = playerStates.lastRunnableCollisionAngle > Math.PI/2? -1 : 0;
      let Yacceleration = -YDirectionalVelocity*playerAcceleration*0.5 + YDirectionalVelocity*playerAcceleration*Math.cos(playerStates.lastRunnableCollisionAngle)
      playerItemData.YVelocity += Yacceleration;
    }

    if(!playerItemData.gravity) {
      if(playerItemData.YVelocity > -maxXVelocity && playerControls.ArrowDown)
        playerItemData.YVelocity -= playerAcceleration;
  
      if(playerItemData.YVelocity < maxXVelocity && playerControls.ArrowUp)
        playerItemData.YVelocity += playerAcceleration;
    }

    if(DOMplayerCharacter.offsetHeight >= playerItemData.ballradius*1.7
      && playerItemData.YCordinate <= groundHeight
      && playerControls.ArrowDown) {
      DOMplayerCharacter.style.height = playerItemData.ballradius*1.8 + "px";
      playerCharacterImage.style.height = playerItemData.ballradius*1.8 + "px";
    }
    else if(DOMplayerCharacter.offsetHeight <= playerItemData.ballradius*1.7 &&
      (playerItemData.YCordinate > groundHeight || !playerControls.ArrowDown)){
      DOMplayerCharacter.style.height = playerItemData.ballradius*2 + "px";
      playerCharacterImage.style.height = playerItemData.ballradius*2 + "px";
    }
}

export function playerControlsManager(playerControls, playerStates) {
  window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }

    switch (event.key) {
      case " ":
        playerControls.Space = true;
        break;
      case "ArrowUp":
        playerControls.ArrowUp = true;
        break;
      case "ArrowLeft":
        playerControls.ArrowLeft = true;
        playerStates.lastMoveIsRight = false;
        break;
      case "ArrowRight":
        playerControls.ArrowRight = true;
        playerStates.lastMoveIsRight = true;
        break;
      case "ArrowDown":
        playerControls.ArrowDown = true;
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