import { playerMovement } from "@/itemControl/playermovement";
import collision from "./collision";
import gravityAndVelocityDecayAndLevelTransitions from "./gravity";
import { playerAnimation } from "@/itemControl/playerAnimation";
import {cameraAndTransitions} from "@/itemControl/cameraAndTransitions";

export default function allFrames(frameIntervalObject, items, levelTransitionData, levelProperties, playerControls, playerSettings, playerStates, environmentStates, coordinateCheck, currentLevel, setCurrentLevel, reloadLevelItems, setReloadLevelItems, playerDeathHandler) {

    let DomItems = document.getElementsByClassName("domItem");
    let DOMplayerCharacter = document.getElementsByClassName("playercharacter");
    let playerCharacterImage = document.getElementsByClassName("imageFrames");
    let walkframeCount =  playerSettings.walkframeCount;
    let cameraFrame = document.getElementsByClassName("cameraFrame")[0];
    let playerIndex = items.findIndex((item) => item.isPlayer);
    let playerItemData = items[playerIndex];
    let currentTime = new Date();

    function itemsUpdate(){
        currentTime.setMilliseconds(currentTime.getMilliseconds() + environmentStates.timeInterval);
        gravityAndVelocityDecayAndLevelTransitions(items, levelTransitionData, levelProperties, playerControls, playerSettings, playerStates, environmentStates, currentTime, currentLevel, setCurrentLevel);
        playerMovement(items, playerItemData, playerControls, playerSettings, playerStates, environmentStates.groundHeight, DOMplayerCharacter[0], playerCharacterImage[0], environmentStates.timeInterval, currentTime);
        collision(items, playerStates, playerSettings, coordinateCheck, environmentStates, currentTime, playerDeathHandler);
        cameraAndTransitions(levelProperties, playerItemData, cameraFrame, environmentStates.roomWidth, environmentStates.roomHeight);
        items.forEach((item, index) => {
            DomItems[index].style.left = item.XCordinate + "px";
            DomItems[index].style.bottom = item.YCordinate + "px";
            if(item.isPlayer) {
                playerAnimation(item, playerCharacterImage[0], playerSettings, currentTime, walkframeCount);
            }
        });
    }

    if(!frameIntervalObject || !reloadLevelItems) {
        currentTime = new Date();
        setReloadLevelItems(false);
        clearInterval(frameIntervalObject);
        frameIntervalObject = setInterval(itemsUpdate, environmentStates.timeInterval);
    }
    return frameIntervalObject;
}