export function playerMovement(items, playerControls, playerSettings, playerStates, groundHeight, DOMplayerCharacter, playerCharacterImage, timeInterval, currentTime) {

    let maxXVelocity = playerSettings.maxXVelocity;
    let playerAcceleration = playerSettings.playerAcceleration;
    let jumpVelocity = playerSettings.jumpVelocity;
    let dashVelocity = playerSettings.dashVelocity;

    let playerIndex = items.findIndex((item) => item.isPlayer);
    let currentXVelocity = items[playerIndex].XVelocity;
    let jumpAllowedDeadline = new Date(playerStates.lastJumpableCollisionTime.getTime() + playerSettings.minJumpDeadline*(timeInterval/10));

    if(jumpAllowedDeadline < currentTime){
      playerStates.jumpAvailable = false;
      playerStates.lastRunnableCollisionAngle = Math.PI/2;
    }

    if(items[playerIndex].YCordinate < groundHeight + 5){
      playerStates.dashCount = playerSettings.maxDashCount;
      playerStates.jumpAvailable = true;
    }

    //Jump movement
    if(playerControls.Space && (playerStates.jumpAvailable || items[playerIndex].YCordinate < (groundHeight + 5))){
        items[playerIndex].YCordinate = items[playerIndex].YCordinate + 1;
        items[playerIndex].YVelocity = (playerControls.ArrowDown? 1.2 : 1) * jumpVelocity;
        playerStates.jumpAvailable = false;
    }
    if(items[playerIndex].type == "ball"
      && (DOMplayerCharacter.offsetHeight <= 2*items[playerIndex].ballradius || DOMplayerCharacter.offsetWidth <= 1.7*items[playerIndex].ballradius)
      && currentTime >= playerStates.lastDashTime){
      DOMplayerCharacter.style.height = items[playerIndex].ballradius*2 + "px";
      DOMplayerCharacter.style.width = items[playerIndex].ballradius*2 + "px";
      playerCharacterImage.style.height = items[playerIndex].ballradius*2 + "px";
      playerCharacterImage.style.width = items[playerIndex].ballradius*2 + "px";
    }

    //dash movement. shift + directional
    if(playerControls.Shift && playerStates.dashCount > 0 && playerStates.lastDashTime <= currentTime){
      items[playerIndex].YCordinate = items[playerIndex].YCordinate + 1;
      --playerStates.dashCount;
      playerStates.jumpAvailable = false;
      playerStates.lastDashTime = new Date(currentTime.getTime() + playerSettings.minDashDelay*(timeInterval/10));
      if(playerControls.ArrowLeft && playerControls.ArrowUp){
        items[playerIndex].YVelocity = 0.8 * dashVelocity;
        items[playerIndex].XVelocity = -0.8 * dashVelocity;
      }
      else if(playerControls.ArrowRight && playerControls.ArrowUp){
        items[playerIndex].YVelocity = 0.8 * dashVelocity;
        items[playerIndex].XVelocity = 0.8 * dashVelocity;
      }
      else if(playerControls.ArrowRight && playerControls.ArrowDown){
        items[playerIndex].YVelocity = -0.5 * dashVelocity;
        items[playerIndex].XVelocity = 0.8 * dashVelocity;
      }
      else if(playerControls.ArrowLeft && playerControls.ArrowDown){
        items[playerIndex].YVelocity = -0.5 * dashVelocity;
        items[playerIndex].XVelocity = -0.8 * dashVelocity;
      }
      else if(playerControls.ArrowUp){
        DOMplayerCharacter.style.height = items[playerIndex].ballradius*2 + "px";
        playerCharacterImage.style.height = items[playerIndex].ballradius*2 + "px";
        items[playerIndex].YVelocity = dashVelocity;
        items[playerIndex].XVelocity = 0;
      }
      else if(playerControls.ArrowLeft){
        DOMplayerCharacter.style.width = items[playerIndex].ballradius*1.9 + "px";
        items[playerIndex].XVelocity = -dashVelocity;
        items[playerIndex].YVelocity = 0.2 * dashVelocity;
      }
      else if(playerControls.ArrowRight){
        DOMplayerCharacter.style.width = items[playerIndex].ballradius*1.9 + "px";
        items[playerIndex].XVelocity = dashVelocity;
        items[playerIndex].YVelocity = 0.2 * dashVelocity;
      }
      else if(playerControls.ArrowDown){
        DOMplayerCharacter.style.width = items[playerIndex].ballradius*1.9 + "px";
        items[playerIndex].YVelocity = -dashVelocity;
        items[playerIndex].XVelocity = 0;
      }
      else{
        items[playerIndex].XVelocity =  (playerStates.lastMoveIsRight? 1 : -1)*dashVelocity;
      }
    }

    //ArrowKey Movements. directional
    if(items[playerIndex].XVelocity > -maxXVelocity  && playerControls.ArrowLeft){
      if(![...DOMplayerCharacter.classList].includes("imgflip")){
        DOMplayerCharacter.classList.add("imgflip")
      };
      let Xacceleration = -playerAcceleration*Math.cos(playerStates.lastRunnableCollisionAngle - Math.PI/2);
      items[playerIndex].XVelocity += Xacceleration;
      let YDirectionalVelocity = playerStates.lastRunnableCollisionAngle > Math.PI/2? 0 : 1;
      let Yacceleration = YDirectionalVelocity*playerAcceleration*0.5 + YDirectionalVelocity*playerAcceleration*Math.cos(playerStates.lastRunnableCollisionAngle);
      items[playerIndex].YVelocity += Yacceleration;
    }

    if(items[playerIndex].XVelocity < maxXVelocity && playerControls.ArrowRight){
      if([...DOMplayerCharacter.classList].includes("imgflip")){
        DOMplayerCharacter.classList.remove("imgflip");
      };
      let Xacceleration = playerAcceleration*Math.cos(playerStates.lastRunnableCollisionAngle - Math.PI/2);
      items[playerIndex].XVelocity += Xacceleration;
      let YDirectionalVelocity = playerStates.lastRunnableCollisionAngle > Math.PI/2? -1 : 0;
      let Yacceleration = -YDirectionalVelocity*playerAcceleration*0.5 + YDirectionalVelocity*playerAcceleration*Math.cos(playerStates.lastRunnableCollisionAngle)
      items[playerIndex].YVelocity += Yacceleration;
    }

    if(!items[playerIndex].gravity) {
      if(items[playerIndex].YVelocity > -maxXVelocity && playerControls.ArrowDown)
        items[playerIndex].YVelocity -= playerAcceleration;
  
      if(items[playerIndex].YVelocity < maxXVelocity && playerControls.ArrowUp)
        items[playerIndex].YVelocity += playerAcceleration;
    }

    if(DOMplayerCharacter.offsetHeight >= items[playerIndex].ballradius*1.7
      && items[playerIndex].YCordinate <= groundHeight
      && playerControls.ArrowDown) {
      DOMplayerCharacter.style.height = items[playerIndex].ballradius*1.8 + "px";
      playerCharacterImage.style.height = items[playerIndex].ballradius*1.8 + "px";
    }
    else if(DOMplayerCharacter.offsetHeight <= items[playerIndex].ballradius*1.7 &&
      (items[playerIndex].YCordinate > groundHeight || !playerControls.ArrowDown)){
      DOMplayerCharacter.style.height = items[playerIndex].ballradius*2 + "px";
      playerCharacterImage.style.height = items[playerIndex].ballradius*2 + "px";
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