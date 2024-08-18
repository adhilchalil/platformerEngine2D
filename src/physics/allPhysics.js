import { playerMovement } from "@/itemControl/playermovement";
import collision from "./collision";
import gravityAndVelocityDecay from "./gravity";
import { playerAnimation } from "@/itemControl/playerAnimation";

var allFrameSetInterval = "";
export default function allFrames(items, playerControls, playerSettings, playerStates, environmentStates, coordinateCheck, currentLevel, setCurrentLevel, reloadLevelItems, setReloadLevelItems) {

    let DomItems = document.getElementsByClassName("domItem");
    let DOMplayerCharacter = document.getElementsByClassName("playercharacter");
    let playerCharacterImage = document.getElementsByClassName("imageFrames");
    let walkframeCount =  playerSettings.walkframeCount;

    function itemsUpdate(){
        let currentTIme = new Date();
        gravityAndVelocityDecay(items, playerControls, playerSettings, playerStates, environmentStates, currentTIme, currentLevel, setCurrentLevel);
        playerMovement(items, playerControls, playerSettings, playerStates, environmentStates.groundHeight, DOMplayerCharacter[0], playerCharacterImage[0], environmentStates.timeInterval, currentTIme);
        collision(items, playerStates, playerSettings, coordinateCheck, environmentStates, currentTIme);
        items.forEach((item, index) => {
            DomItems[index].style.left = item.XCordinate + "px";
            DomItems[index].style.bottom = item.YCordinate + "px";
            if(item.isPlayer) {
                playerAnimation(item, playerCharacterImage[0], playerSettings, currentTIme, walkframeCount);
            }
        });
    }

    if(!allFrameSetInterval || !reloadLevelItems) {
        setReloadLevelItems(false);
        clearInterval(allFrameSetInterval);
        allFrameSetInterval = setInterval(itemsUpdate, environmentStates.timeInterval);
    }
    return allFrameSetInterval;
}