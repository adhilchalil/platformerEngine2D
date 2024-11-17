import { playerMovement } from "@/itemControl/playermovement";
import collision from "./collision";
import gravityAndVelocityDecayAndLevelTransitions from "./gravity";
import { playerAnimation } from "@/itemControl/playerAnimation";
import {cameraAndTransitions} from "@/itemControl/cameraAndTransitions";
import itemsCentreCalc from "@/utilities/itemsCentreCalc";

export default function allFrames(frameIntervalObject, items, levelTransitionData, levelProperties, playerControls, playerSettings, playerStates, environmentStates, coordinateCheck, currentLevel, setCurrentLevel, reloadLevelItems, setReloadLevelItems, playerDeathHandler, DOMElements) {

    let DomItems = DOMElements.DomItems;
    let DOMplayerCharacter = DOMElements.DOMplayerCharacter;
    let playerCharacterImage = DOMElements.playerCharacterImage;
    let walkframeCount =  playerSettings.walkframeCount;
    let cameraFrame = DOMElements.cameraFrame;
    let lightingElement = DOMElements.lightingElement;
    let playerIndex = items.findIndex((item) => item.isPlayer);
    let playerItemData = items[playerIndex];
    let currentTime = new Date();
    let initialFrame = true;

    function itemsUpdate(){
        currentTime.setMilliseconds(currentTime.getMilliseconds() + environmentStates.timeInterval);
        itemsCentreCalc(items);
        gravityAndVelocityDecayAndLevelTransitions(items, levelTransitionData, levelProperties, playerControls, playerSettings, playerStates, environmentStates, currentTime, currentLevel, setCurrentLevel);
        playerMovement(items, playerItemData, playerControls, playerSettings, playerStates, environmentStates.groundHeight, DOMplayerCharacter[0], playerCharacterImage[0], environmentStates.timeInterval, currentTime);
        collision(items, playerStates, playerSettings, coordinateCheck, environmentStates, currentTime, playerDeathHandler);
        cameraAndTransitions(initialFrame, levelProperties, playerItemData, cameraFrame, environmentStates.roomWidth, environmentStates.roomHeight);
        let lightRadius = document.documentElement.style.getPropertyValue('--lightRadius');
        if(levelProperties.night && lightRadius == "0px"){
            document.documentElement.style.setProperty('--lightRadius', 400 + 'px');
        }
        if(!levelProperties.night && lightRadius == "400px"){
            document.documentElement.style.setProperty('--lightRadius', 0 + 'px');
        }
        document.documentElement.style.setProperty('--playerpositionX', playerItemData.centreXCordinate + 'px');
        document.documentElement.style.setProperty('--playerpositionY', (levelProperties.height - playerItemData.centreYCordinate) + 'px');
        items.forEach((item, index) => {
            DomItems[index].style.left = item.XCordinate + "px";
            DomItems[index].style.bottom = item.YCordinate + "px";
            if(item.isPlayer) {
                playerAnimation(item, playerCharacterImage[0], playerSettings, currentTime, walkframeCount);
            }
        });
        initialFrame = false;
    }

    if(!frameIntervalObject || !reloadLevelItems) {
        currentTime = new Date();
        setReloadLevelItems(false);
        clearInterval(frameIntervalObject);
        frameIntervalObject = setInterval(itemsUpdate, environmentStates.timeInterval);
    }
    return frameIntervalObject;
}