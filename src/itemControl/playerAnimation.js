export function playerAnimation(item, playerItem, playerSettings, currentTIme, walkframeCount, jumpFrameCount, dashFrameCount, fallFrameCount) {
  let frameCount = walkframeCount;
  let time = currentTIme.getMilliseconds()*1*(Math.abs(item.XVelocity)/playerSettings.maxXVelocity);
  if(playerItem) {
    let frameIndex = Math.round((time%250)/(250/(frameCount-1)))+1;
    if(!playerItem.src.includes("walk_cycle" + frameIndex) && Math.abs(item.XVelocity) > 0){
      playerItem.src = "/walk_cycle" + (Math.abs(item.XVelocity) > 1?frameIndex+2 : frameIndex) +".png";
    }
    else if(!playerItem.src.includes("walk_cycle1.png") && item.XVelocity == 0){
      playerItem.src = "/walk_cycle1.png";
    }
    // if(!playerItem.src.includes("jump_cycle" + frameIndex) && Math.abs(item.YVelocity) > 0.2){
    //   playerItem.src = "/jump_cycle" + (frameIndex) +".png";
    // }
    // if(!playerItem.src.includes("fall_cycle" + frameIndex) && Math.abs(item.YVelocity) < -0.2){
    //   playerItem.src = "/fall_cycle" + (frameIndex) +".png";
    // }
  }
}