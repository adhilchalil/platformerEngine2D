export function playerAnimation(item, playerItem, walkframeCount, jumpFrameCount, dashFrameCount, fallFrameCount) {
  let frameCount = 2;
  let time = new Date().getMilliseconds();
  if(playerItem) {
    let frameIndex = Math.round((time%250)/(250/(frameCount-1)))+1;
    if(!playerItem.src.includes("walk_cycle" + frameIndex) && Math.abs(item.XVelocity) > 0.2){
      playerItem.src = "/walk_cycle" + (frameIndex) +".png";
    }
    else if(!playerItem.src.includes("walk_cycle1.png") && Math.abs(item.XVelocity) < 0.2){
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