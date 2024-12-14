import { playerMovement } from "@/itemControl/playermovement";
import collision from "./collision";
import gravityAndVelocityDecayAndLevelTransitions from "./gravity";
import { playerAnimation } from "@/itemControl/playerAnimation";
import {cameraAndTransitions} from "@/itemControl/cameraAndTransitions";
import itemsMiscellaneousCalc from "@/utilities/itemsMiscellaneousCalc";

export default function allFrames(frameIntervalObject, items, levelTransitionData, levelProperties, playerControls, playerSettings, playerStates, playerInputHistory, environmentStates, coordinateCheck, currentLevel, setCurrentLevel, reloadLevelItems, setReloadLevelItems, playerDeathHandler, DOMElements) {

    let DomItems = DOMElements.DomItems;
    let DOMplayerCharacter = DOMElements.DOMplayerCharacter;
    let playerCharacterImage = DOMElements.playerCharacterImage;
    let cameraFrame = DOMElements.cameraFrame;
    let lightingElement = DOMElements.lightingElement;
    let playerIndex = items.findIndex((item) => item.isPlayer);
    let updatingLightDOMItems = document.getElementsByClassName("updatingLightSource"); 
    let playerItemData = items[playerIndex];
    let currentTime = new Date();
    let currentFrame = "walk"; //possible values idle, walk, jump, fall Used in playerAnimation Function.
    let lastFrameCount = 0;
    let initialFrame = true;


    function itemsUpdate(){
        currentTime.setMilliseconds(currentTime.getMilliseconds() + environmentStates.timeInterval);
        itemsMiscellaneousCalc(items);
        gravityAndVelocityDecayAndLevelTransitions(items, levelTransitionData, levelProperties, playerControls, playerSettings, playerStates, environmentStates, currentTime, currentLevel, setCurrentLevel);
        playerMovement(items, playerItemData, playerControls, playerSettings, playerStates, environmentStates, DOMplayerCharacter[0], playerCharacterImage[0], environmentStates.timeInterval, currentTime);
        collision(items, playerStates, playerSettings, coordinateCheck, environmentStates, currentTime, playerDeathHandler);
        cameraAndTransitions(initialFrame, levelProperties, playerItemData, playerControls, playerInputHistory, cameraFrame, environmentStates.roomWidth, environmentStates.roomHeight, currentTime);

        let lightSourceIndex = 0;
        items.forEach((item, index) => {
            DomItems[index].style.left = item.XCordinate + "px";
            DomItems[index].style.bottom = item.YCordinate + "px";
            if(updatingLightDOMItems?.length && (!item.rigid || item.lightSourceFlicker) && item.lightSource){
                updatingLightDOMItems[lightSourceIndex].setAttribute('cx', item.centreXCordinate);
                updatingLightDOMItems[lightSourceIndex].setAttribute('cy', levelProperties.height - item.centreYCordinate);
                if(item.lightSourceFlicker){
                    let sinWaveAngle = (item.currentFlickerFrame/item.lightSourceFlickerFrames)*Math.PI
                    updatingLightDOMItems[lightSourceIndex].setAttribute('r', item.lightSourceRadius - (item.lightFlickerRadiusChange * (Math.sin(sinWaveAngle))));
                }
                lightSourceIndex++;
            }
            if(item.isPlayer) {
                lastFrameCount, currentFrame = playerAnimation(item, playerCharacterImage[0], playerSettings, playerStates, currentTime, currentFrame, lastFrameCount);
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