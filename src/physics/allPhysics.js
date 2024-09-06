import { playerMovement } from "@/itemControl/playermovement";
import collision from "./collision";
import gravityAndVelocityDecay from "./gravity";
import { playerAnimation } from "@/itemControl/playerAnimation";

export default function allFrames(frameIntervalObject, items, levelTransitionData, playerControls, playerSettings, playerStates, environmentStates, coordinateCheck, currentLevel, setCurrentLevel, reloadLevelItems, setReloadLevelItems, playerDeathHandler) {

    let DomItems = document.getElementsByClassName("domItem");
    let DOMplayerCharacter = document.getElementsByClassName("playercharacter");
    let playerCharacterImage = document.getElementsByClassName("imageFrames");
    let walkframeCount =  playerSettings.walkframeCount;
    let currentTIme = new Date();

    function itemsUpdate(){
        currentTIme.setMilliseconds(currentTIme.getMilliseconds() + environmentStates.timeInterval);
        gravityAndVelocityDecay(items, levelTransitionData, playerControls, playerSettings, playerStates, environmentStates, currentTIme, currentLevel, setCurrentLevel);
        playerMovement(items, playerControls, playerSettings, playerStates, environmentStates.groundHeight, DOMplayerCharacter[0], playerCharacterImage[0], environmentStates.timeInterval, currentTIme);
        collision(items, playerStates, playerSettings, coordinateCheck, environmentStates, currentTIme, playerDeathHandler);
        items.forEach((item, index) => {
            DomItems[index].style.left = item.XCordinate + "px";
            DomItems[index].style.bottom = item.YCordinate + "px";
            if(item.isPlayer) {
                playerAnimation(item, playerCharacterImage[0], playerSettings, currentTIme, walkframeCount);
            }
        });
    }

    if(!frameIntervalObject || !reloadLevelItems) {
        currentTIme = new Date();
        setReloadLevelItems(false);
        clearInterval(frameIntervalObject);
        frameIntervalObject = setInterval(itemsUpdate, environmentStates.timeInterval);
    }
    return frameIntervalObject;
}