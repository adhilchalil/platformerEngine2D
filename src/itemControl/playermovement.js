export function playerMovement(items, playerControls, playerSettings, playerStates, groundHeight, DOMplayerCharacter, playerCharacterImage, timeInterval) {

    let maxXVelocity = playerSettings.maxXVelocity;
    let playerAcceleration = playerSettings.playerAcceleration;
    let jumpVelocity = playerSettings.jumpVelocity;
    let dashVelocity = playerSettings.dashVelocity;

    let playerIndex = items.findIndex((item) => item.isPlayer);
    let currentXVelocity = items[playerIndex].XVelocity

    if(items[playerIndex].YCordinate < groundHeight + 5){
      playerStates.dashCount = playerSettings.maxDashCount;
      playerStates.jumpAvailable = true;
    }
    if(playerControls.Space && playerStates.jumpAvailable){
      items[playerIndex].YCordinate = items[playerIndex].YCordinate;
      items[playerIndex].YVelocity = (playerControls.ArrowDown? 1.2 : 1) * jumpVelocity;
      playerStates.jumpAvailable = false;
    }
    if(items[playerIndex].type == "ball"
      && (DOMplayerCharacter.offsetHeight <= 2*items[playerIndex].ballradius || DOMplayerCharacter.offsetWidth <= 1.7*items[playerIndex].ballradius)
      && new Date() >= playerStates.lastDashTime){
      DOMplayerCharacter.style.height = items[playerIndex].ballradius*2 + "px";
      DOMplayerCharacter.style.width = items[playerIndex].ballradius*2 + "px";
      playerCharacterImage.style.height = items[playerIndex].ballradius*2 + "px";
      playerCharacterImage.style.width = items[playerIndex].ballradius*2 + "px";
    }
    if(playerControls.Shift && playerStates.dashCount > 0 && playerStates.lastDashTime <= new Date()){
      items[playerIndex].YCordinate = items[playerIndex].YCordinate;
      --playerStates.dashCount;
      playerStates.jumpAvailable = false;
      let currentDateTime = new Date();
      playerStates.lastDashTime = currentDateTime.setMilliseconds(currentDateTime.getMilliseconds() + playerSettings.minDashDelay*(timeInterval/10));
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
      }
      else{
        items[playerIndex].XVelocity =  (playerStates.lastMoveIsRight? 1 : -1)*dashVelocity;
      }
    }
    if(items[playerIndex].XVelocity > -maxXVelocity  && playerControls.ArrowLeft){
      if(![...DOMplayerCharacter.classList].includes("imgflip")){
        DOMplayerCharacter.classList.add("imgflip")
      };
      items[playerIndex].XVelocity -= playerAcceleration;
    }

      

    if(items[playerIndex].XVelocity < maxXVelocity && playerControls.ArrowRight){
      if([...DOMplayerCharacter.classList].includes("imgflip")){
        DOMplayerCharacter.classList.remove("imgflip");
      };
      items[playerIndex].XVelocity += playerAcceleration;
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
      DOMplayerCharacter.style.height = items[playerIndex].ballradius*1.6 + "px";
      playerCharacterImage.style.height = items[playerIndex].ballradius*1.6 + "px";
    }
    else if(DOMplayerCharacter.offsetHeight <= items[playerIndex].ballradius*1.7 &&
      (items[playerIndex].YCordinate > groundHeight || !playerControls.ArrowDown)){
      DOMplayerCharacter.style.height = items[playerIndex].ballradius*2.2 + "px";
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