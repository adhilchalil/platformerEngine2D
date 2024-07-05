import { playerMovement } from "@/itemControl/playermovement";
import collision from "./collision";
import gravityAndVelocityDecay from "./gravity";
import { playerAnimation } from "@/itemControl/playerAnimation";

var allFrameSetInterval = "";
export default function allFrames(items, playerControls, playerSettings, playerStates, environmentStates, coordinateCheck) {

    let DomItems = document.getElementsByClassName("domItem");
    let DOMplayerCharacter = document.getElementsByClassName("playercharacter");
    let playerCharacterImage = document.getElementsByClassName("imageFrames");

    function itemsUpdate(){
        gravityAndVelocityDecay(items, playerControls, playerSettings, playerStates,environmentStates);
        playerMovement(items, playerControls, playerSettings, playerStates, environmentStates.groundHeight, DOMplayerCharacter[0], playerCharacterImage[0], environmentStates.timeInterval);
        collision(items, playerStates, playerSettings, coordinateCheck, environmentStates);
        items.forEach((item, index) => {
            DomItems[index].style.left = item.XCordinate + "px";
            DomItems[index].style.bottom = item.YCordinate + "px";
            if(item.isPlayer){
                playerAnimation(item, playerCharacterImage[0]);
            }
        });
    }

    if(!allFrameSetInterval) {
        allFrameSetInterval = setInterval(itemsUpdate, environmentStates.timeInterval);
    }
}