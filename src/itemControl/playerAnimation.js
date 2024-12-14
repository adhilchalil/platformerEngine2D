export function playerAnimation(item, playerItem, playerSettings, playerStates, currentTime, currentFrame, lastFrame) {
  if(playerItem) {
    if(item.idleFrameCount &&  Math.abs(item.XVelocity) < 0.1 &&  Math.abs(item.YVelocity) < 0.1){
      if(currentFrame != "idle"){
        let idleFrameIndex = (lastFrame%item.idleFrameCount) + 1;
        playerItem.src = item.playerIdleAnimationTitle + idleFrameIndex + "." + item.playerIdleAnimationFormat;
        currentFrame = "idle";
      }
    }
    else if(item.walkframeCount && Math.abs(item.XVelocity) > 0 && item.YVelocity < 0.2) {
      if(currentFrame != "walk"){
        let walkFrameIndex = (lastFrame%item.walkFrameCount) + 1;
        playerItem.src = item.playerWalkAnimationTitle + walkFrameIndex + "." + item.playerWalkAnimationFormat;
        currentFrame = "walk";
      }
    }
    else if(item.jumpFrameCount && item.YVelocity > 0.2){
      if(currentFrame != "jump"){
        let jumpFrameIndex = (lastFrame%item.jumpFrameCount) + 1;
        playerItem.src = item.playerJumpAnimationTitle + jumpFrameIndex + "." + item.playerJumpAnimationFormat;
        currentFrame = "jump";
      }
    }
    else if(item.fallFrameCount && item.YVelocity < -0.2 && !playerStates.jumpAvailable){
      if(currentFrame != "fall"){
        let fallFrameIndex = (lastFrame%item.fallFrameCount) + 1;
        playerItem.src = item.playerFallAnimationTitle + fallFrameIndex + "." + item.playerFallAnimationFormat;
        currentFrame = "fall";
      }
    }
    else{
      if(currentFrame != "idle" && playerStates.jumpAvailable){
        let idleFrameIndex = (lastFrame%item.idleFrameCount) + 1;
        playerItem.src = item.playerIdleAnimationTitle + idleFrameIndex + "." + item.playerIdleAnimationFormat;
        currentFrame = "idle";
      }
    }
    return lastFrame, currentFrame;
  }
}