import Ball from "@/objects/ball";
import Box from "@/objects/box";
import allFrames from "@/physics/allPhysics";
import { playerControlsManager } from "@/itemControl/playermovement";
import { useEffect, useState } from "react";

var frameIntervalObject = null;
var allRenderedItems = [];
var levelTransitionData = {};
var levelProperties = {};

const restrictedBoundary = Number(process.env.NEXT_PUBLIC_BOUNDARY_RESTRICTED)? true: false;
const groundheight = Number(process.env.NEXT_PUBLIC_GROUNDHEIGHT);
const roomHeight = Number(process.env.NEXT_PUBLIC_ROOMHEIGHT);
const roomWidth = Number(process.env.NEXT_PUBLIC_ROOMWIDTH);
const gravityrate =  Number(process.env.NEXT_PUBLIC_GRAVITYRATE);

const environmentDesigns = {
    backgroundColor: "grey",
    backgroundImage: "2d_platformer_background_desert.jpg",
    backgroundRepeat: "round",
    backgroundAttachment: "fixed",
    backgroundSize: "cover",
};

const environmentStates = {
    roomHeight : roomHeight,
    roomWidth : roomWidth,
    gravityrate : gravityrate,
    timeInterval : Number(process.env.NEXT_PUBLIC_SECOND_PER_FRAME),
    itemsMinimumVelocity : Number(process.env.NEXT_PUBLIC_MINIMUM_GROUND_VELOCITY),
    restrictedBoundary : restrictedBoundary,
    groundHeight : groundheight,
    maxYVelocity : Number(process.env.NEXT_PUBLIC_MAX_Y_VELOCITY),
    gravityAcceleration: gravityrate*0.01,
    showHitBox: Number(process.env.NEXT_PUBLIC_SHOW_HITBOX)? true : false
};

const playerControls = {
    Space: false,
    ArrowRight: false,
    ArrowLeft: false,
    ArrowUp: false,
    ArrowDown: false,
    Shift: false
};

const coordinateCheck = [];

const playerSettings = {
    maxXVelocity : Number(process.env.NEXT_PUBLIC_PLAYER_MAX_X_VELOCITY),
    playerAcceleration : Number(process.env.NEXT_PUBLIC_PLAYER_ACCELERATION),
    XVelocityDecay: Number(process.env.NEXT_PUBLIC_PLAYER_XVELOCITY_DECAY),
    jumpVelocity: Number(process.env.NEXT_PUBLIC_PLAYER_JUMP_VELOCITY),
    dashVelocity: Number(process.env.NEXT_PUBLIC_PLAYER_DASH_VELOCITY),
    minJumpDeadline: Number(process.env.NEXT_PUBLIC_PLAYER_JUMP_DEADLINE),
    minDashDelay: Number(process.env.NEXT_PUBLIC_PLAYER_DASH_DELAY), //in millisec
    maxDashCount: Number(process.env.NEXT_PUBLIC_PLAYER_DASH_COUNT),
    minimumGroundVelocity: Number(process.env.NEXT_PUBLIC_PLAYER_MINIMUM_GROUND_VELOCITY),
    walkframeCount: Number(process.env.NEXT_PUBLIC_PLAYER_WALKFRAME_COUNT)
};

const playerStates = {
    jumpAvailable: true,
    dashCount: 1,
    lastDashTime: new Date(),
    lastJumpableCollisionTime: new Date(),
    lastRunnableCollisionAngle: Math.PI/2,
};

const playerItems= [
    {
        type: "ball",
        ballradius: 60,
        // ballcolor: "rgba(255, 0, 0, 0.2)",
        XCordinate: 100,
        YCordinate: 300,
        XVelocity: 2,
        YVelocity: 0,
        gravity: true,
        elasticity: 0,
        isPlayer: true,
        rigid: false,
        srcImage: "/walk_cycle1.png",
        hitboxRadiusRatio: 1
    }];

const allLevelData = [
    {
        levelProperties: {
            height: roomHeight*2,
            width: roomWidth*1.2,
            offsetRight: 0,
            offsetLeft: 0,
            offsetUp: 0,
            offsetDown: 0,
        },
        levelTransitions: {
            up: null,
            down: null,
            left: 3,
            right: 2
        },
        levelRespawns: {
            default: [100, 100],
            up: [100, 100],
            down: [100, 100],
            left: [100, 100],
            right: [2000, 100, 0.1],
        },
        levelItems:
            [
                {
                    type: "box",
                    height: groundheight,
                    width: 1.2*roomWidth,
                    tilt: 0,
                    boxcolor: "#8B4513",
                    XCordinate: 0,
                    YCordinate: 0,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                },
                {
                    type: "box",
                    height: 50,
                    width: 50,
                    tilt: 0,
                    // boxcolor: "rgba(255, 255, 0, 0.2)",
                    // boxcolor: "#777513",
                    XCordinate: 1300,
                    YCordinate: roomHeight,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    srcImage: "/fire.gif",
                    hitboxWidthRatio: 1.6,
                    hitboxHeightRatio: 2,
                    modelAlignmentTop: 20,
                    deathZone: true
                },
                {
                    type: "box",
                    height: 50,
                    width: 50,
                    tilt: 0,
                    // boxcolor: "rgba(255, 255, 0, 0.2)",
                    // boxcolor: "#777513",
                    XCordinate: 1300,
                    YCordinate: 100,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    srcImage: "/fire.gif",
                    hitboxWidthRatio: 1.6,
                    hitboxHeightRatio: 2,
                    modelAlignmentTop: 20,
                    deathZone: true
                },
                {
                    type: "box",
                    height: 100,
                    width: 300,
                    tilt: 20,
                    // boxcolor: "rgba(255, 255, 0, 0.2)",
                    XCordinate: 1500,
                    YCordinate: 400,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    srcImage: "/platform3.png",
                    hitboxWidthRatio: 1,
                    hitboxHeightRatio: 1.7,
                    modelAlignmentLeft: 50, // 0 to 100, default model alignment is 50
                    modelAlignmentTop: 35, // 0 to 100, default model alignment is 50
                },
                {
                    type: "box",
                    height: 100,
                    width: 300,
                    tilt: -20,
                    // boxcolor: "rgba(255, 255, 0, 0.2)",
                    XCordinate: 1000,
                    YCordinate: 490,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    srcImage: "/platform3.png",
                    hitboxWidthRatio: 1,
                    hitboxHeightRatio: 1.7,
                    modelAlignmentLeft: 50, // 0 to 100, default model alignment is 50
                    modelAlignmentTop: 35, // 0 to 100, default model alignment is 50
                },
                {
                    type: "box",
                    height: 100,
                    width: 200,
                    // boxcolor: "rgba(255, 0, 0, 0.2)",
                    tilt: 0,
                    XCordinate: 400,
                    YCordinate: 400,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    srcImage: "/platform2.png",
                    hitboxWidthRatio: 1.1,
                    hitboxHeightRatio: 1.5
                }
            ]
    },
    {
        levelProperties: {
            height: roomHeight,
            width: roomWidth,
        },
        levelTransitions: {
            up: null,
            down: null,
            left: 1,
            right: 3
        },
        levelItems:
            [
                {
                    type: "box",
                    height: groundheight,
                    width: roomWidth,
                    tilt: 0,
                    boxcolor: "#8B4513",
                    XCordinate: 0,
                    YCordinate: 0,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                },
                // {
                //     type: "ball",
                //     ballradius: 65, //pixels
                //     ballcolor: "red",
                //     XCordinate: 300, //percentage
                //     YCordinate: 300, //percentage
                //     XVelocity: 2,
                //     YVelocity: 2,
                //     gravity: true,
                //     elasticity: 0.7,
                //     rigid: true,
                //     hitboxRadiusRatio: 1
                // },
                // {
                //     type: "box",
                //     height: 50,
                //     width: 150,
                //     tilt: 0,
                //     // boxcolor: "rgba(255, 255, 0, 0.2)",
                //     XCordinate: 1300,
                //     YCordinate: 100,
                //     XVelocity: 0,
                //     YVelocity: 0,
                //     gravity: false,
                //     elasticity: 0,
                //     rigid: true,
                //     srcImage: "/platform.png",
                //     hitboxWidthRatio: 1.1,
                //     hitboxHeightRatio: 1.5
                // },
                // {
                //     type: "box",
                //     height: 100,
                //     width: 300,
                //     tilt: 20,
                //     // boxcolor: "rgba(255, 255, 0, 0.2)",
                //     XCordinate: 1500,
                //     YCordinate: 400,
                //     XVelocity: 0,
                //     YVelocity: 0,
                //     gravity: false,
                //     elasticity: 0,
                //     rigid: true,
                //     srcImage: "/platform3.png",
                //     hitboxWidthRatio: 1,
                //     hitboxHeightRatio: 1.7,
                //     modelAlignmentLeft: 50, // 0 to 100, default model alignment is 50
                //     modelAlignmentTop: 35, // 0 to 100, default model alignment is 50
                // },
                // {
                //     type: "box",
                //     height: 100,
                //     width: 300,
                //     tilt: -20,
                //     // boxcolor: "rgba(255, 255, 0, 0.2)",
                //     XCordinate: 1000,
                //     YCordinate: 490,
                //     XVelocity: 0,
                //     YVelocity: 0,
                //     gravity: false,
                //     elasticity: 0,
                //     rigid: true,
                //     srcImage: "/platform3.png",
                //     hitboxWidthRatio: 1,
                //     hitboxHeightRatio: 1.7,
                //     modelAlignmentLeft: 50, // 0 to 100, default model alignment is 50
                //     modelAlignmentTop: 35, // 0 to 100, default model alignment is 50
                // },
                {
                    type: "box",
                    height: 100,
                    width: 200,
                    // boxcolor: "rgba(255, 0, 0, 0.2)",
                    tilt: 0,
                    XCordinate: 400,
                    YCordinate: 400,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    srcImage: "/platform2.png",
                    hitboxWidthRatio: 1.1,
                    hitboxHeightRatio: 1.5
                }
            ]
    },
    {
        levelProperties: {
            height: roomHeight,
            width: roomWidth,
        },
        levelTransitions: {
            up: 3,
            down: 3,
            left: 2,
            right: 1
        },
        levelItems:
        [
            {
                type: "box",
                height: groundheight,
                width: 0.5*roomWidth,
                tilt: 0,
                boxcolor: "#8B4513",
                XCordinate: 0,
                YCordinate: 0,
                XVelocity: 0,
                YVelocity: 0,
                gravity: false,
                elasticity: 0,
                rigid: true,
            },
            {
                type: "box",
                height: groundheight,
                width: 0.3*roomWidth,
                tilt: 0,
                boxcolor: "#8B4513",
                XCordinate: 0.7*roomWidth,
                YCordinate: 0,
                XVelocity: 0,
                YVelocity: 0,
                gravity: false,
                elasticity: 0,
                rigid: true,
            },
            {
                type: "box",
                height: groundheight,
                width: 0.5*roomWidth,
                tilt: 0,
                boxcolor: "#8B4513",
                XCordinate: 0,
                YCordinate: roomHeight - groundheight,
                XVelocity: 0,
                YVelocity: 0,
                gravity: false,
                elasticity: 0,
                rigid: true,
            },
            {
                type: "box",
                height: groundheight,
                width: 0.3*roomWidth,
                tilt: 0,
                boxcolor: "#8B4513",
                XCordinate: 0.7*roomWidth,
                YCordinate: roomHeight - groundheight,
                XVelocity: 0,
                YVelocity: 0,
                gravity: false,
                elasticity: 0,
                rigid: true,
            },
            // {
            //     type: "ball",
            //     ballradius: 65, //pixels
            //     ballcolor: "red",
            //     XCordinate: 300, //percentage
            //     YCordinate: 300, //percentage
            //     XVelocity: 2,
            //     YVelocity: 2,
            //     gravity: true,
            //     elasticity: 0.7,
            //     rigid: true,
            //     hitboxRadiusRatio: 1
            // },
            // {
            //     type: "box",
            //     height: 50,
            //     width: 150,
            //     tilt: 0,
            //     // boxcolor: "rgba(255, 255, 0, 0.2)",
            //     XCordinate: 1300,
            //     YCordinate: 100,
            //     XVelocity: 0,
            //     YVelocity: 0,
            //     gravity: false,
            //     elasticity: 0,
            //     rigid: true,
            //     srcImage: "/platform.png",
            //     hitboxWidthRatio: 1.1,
            //     hitboxHeightRatio: 1.5
            // },
            // {
            //     type: "box",
            //     height: 100,
            //     width: 300,
            //     tilt: 20,
            //     // boxcolor: "rgba(255, 255, 0, 0.2)",
            //     XCordinate: 1500,
            //     YCordinate: 400,
            //     XVelocity: 0,
            //     YVelocity: 0,
            //     gravity: false,
            //     elasticity: 0,
            //     rigid: true,
            //     srcImage: "/platform3.png",
            //     hitboxWidthRatio: 1,
            //     hitboxHeightRatio: 1.7,
            //     modelAlignmentLeft: 50, // 0 to 100, default model alignment is 50
            //     modelAlignmentTop: 35, // 0 to 100, default model alignment is 50
            // },
            // {
            //     type: "box",
            //     height: 100,
            //     width: 300,
            //     tilt: -20,
            //     // boxcolor: "rgba(255, 255, 0, 0.2)",
            //     XCordinate: 1000,
            //     YCordinate: 490,
            //     XVelocity: 0,
            //     YVelocity: 0,
            //     gravity: false,
            //     elasticity: 0,
            //     rigid: true,
            //     srcImage: "/platform3.png",
            //     hitboxWidthRatio: 1,
            //     hitboxHeightRatio: 1.7,
            //     modelAlignmentLeft: 50, // 0 to 100, default model alignment is 50
            //     modelAlignmentTop: 35, // 0 to 100, default model alignment is 50
            // },
        ]
    }
    ];

export default function Gravityroom(){
    const [coordinateCheckUpdate, setCoordinateCheckUpdate] = useState(1);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [lastLevel, setLastLevel] = useState(0);
    const [reloadLevelItems,setReloadLevelItems] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [playerDeath, setPlayerDeath] = useState(false);
    const [levelCompleted, setLevelCompleted] = useState(false);
    const [startGame, setStartGame] = useState(false);

    const levelTransitionTracking = (nextLevel) => {
        setLastLevel(currentLevel);
        setCurrentLevel(nextLevel);
    };

    const playerDeathAnimation = () => {
        // we do this soon
    };

    const playerLocationReset = () => {

        let levelTransitionKey = "default";
        console.log("data", allLevelData[currentLevel-1].levelTransitions, lastLevel);

        for (const [key, value] of Object.entries(allLevelData[currentLevel-1].levelTransitions)) {
            if(value == lastLevel){
                console.log("data", key, lastLevel);
                levelTransitionKey = key;
            }
        }

        let respawnPoints = allLevelData[currentLevel-1].levelRespawns;

        console.log("data", levelTransitionKey, respawnPoints);

        playerItems[0].XCordinate = respawnPoints[levelTransitionKey][0]? respawnPoints[levelTransitionKey][0] : 0;
        playerItems[0].YCordinate = respawnPoints[levelTransitionKey][1]? respawnPoints[levelTransitionKey][1] : 0;
        playerItems[0].XVelocity = respawnPoints[levelTransitionKey][2]? respawnPoints[levelTransitionKey][2] : 0;
        playerItems[0].YVelocity = respawnPoints[levelTransitionKey][3]? respawnPoints[levelTransitionKey][3] : 0;
       
    }

    const playerDeathHandler = () => {
        clearInterval(frameIntervalObject);
        frameIntervalObject = null;
        setReloadLevelItems(true);
        setPlayerDeath(true);
    };

    // IMPORTANT !!!! Dont remove. Useful later. keeps track of items corners
    // To refresh some non state data every few seconds using react state variables to force re-render.
    // const refreshData = setInterval(() => {
    //     setCoordinateCheckUpdate(coordinateCheckUpdate + 1);
    // }, 3000);

    useEffect(() => {
        console.log("useEffect", currentLevel, playerDeath, allLevelData.length, startGame, frameIntervalObject)
        if(currentLevel > 0 && !playerDeath){
            allRenderedItems = [...allLevelData[currentLevel - 1].levelItems, ...playerItems];
            setReloadLevelItems(true);
        }
        if(playerDeath){
            playerDeathAnimation();
            setTimeout(() => {
                playerLocationReset();
                setPlayerDeath(false);
            }, 500);
        }
        else if(currentLevel > 0 && currentLevel <= allLevelData.length){
            allRenderedItems = [...allLevelData[currentLevel - 1].levelItems, ...playerItems];
            levelTransitionData = {...allLevelData[currentLevel - 1].levelTransitions};
            let upIndex = allLevelData[currentLevel - 1].levelTransitions?.up;
            let rightIndex = allLevelData[currentLevel - 1].levelTransitions?.right;
            let downIndex = allLevelData[currentLevel - 1].levelTransitions?.down;
            let leftIndex = allLevelData[currentLevel - 1].levelTransitions?.left;
            console.log(upIndex, rightIndex, downIndex, leftIndex);
            levelProperties = {...allLevelData[currentLevel - 1].levelProperties, 
                up: upIndex? allLevelData[upIndex-1].levelProperties: {},
                right: rightIndex? allLevelData[rightIndex-1].levelProperties: {},
                left: leftIndex? allLevelData[leftIndex-1].levelProperties: {},
                down: downIndex? allLevelData[downIndex-1].levelProperties: {}
            };
            if(frameIntervalObject){
                clearInterval(frameIntervalObject);
            }
            if(startGame){
                setTimeout(() => {
                    console.log("levelProperties", levelProperties);
                    frameIntervalObject = allFrames(frameIntervalObject, allRenderedItems, levelTransitionData, levelProperties, playerControls, playerSettings, playerStates, environmentStates, coordinateCheck, currentLevel, levelTransitionTracking, reloadLevelItems, setReloadLevelItems, playerDeathHandler);
                    playerControlsManager(playerControls, playerStates);
                }, 200);
            }
        }
        else if(currentLevel > allLevelData.length){
            clearInterval(frameIntervalObject);
            frameIntervalObject = null;
            setGameCompleted(true);
        }
    },[currentLevel, playerDeath]);

    return ( 
        <>
            <div className="gravitycontainer cameraFrame fixed mx-auto rounded-md"
                style={{
                    height: roomHeight + "px",
                    width: roomWidth + "px",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    overflow: "scroll"
                }}
            >
                <div className="absolute" style={{
                        backgroundColor: environmentDesigns.backgroundColor? environmentDesigns.backgroundColor: "grey",
                        backgroundImage: environmentDesigns.backgroundImage? `url('${environmentDesigns.backgroundImage}')`: "none",
                        backgroundRepeat: environmentDesigns.backgroundRepeat? environmentDesigns.backgroundRepeat: "no-repeat",
                        backgroundAttachment: environmentDesigns.backgroundAttachment? environmentDesigns.backgroundAttachment: "fixed",
                        backgroundSize: environmentDesigns.backgroundSize? environmentDesigns.backgroundSize: "cover",
                        height: levelProperties.height + "px",
                        width : levelProperties.width + "px",
                    }}
                >
                    {startGame && currentLevel && !playerDeath ? allRenderedItems.map((item,index) => 
                        item.type == "ball" ?
                            <Ball
                                key={index}
                                ballradius={item.ballradius}
                                ballcolor={item.ballcolor}
                                XCordinate={item.XCordinate}
                                YCordinate={item.YCordinate}
                                XVelocity={item.XVelocity}
                                YVelocity={item.YVelocity}
                                gravity={item.gravity}
                                isPlayer={item.isPlayer}
                                srcImage={item.srcImage}
                                hitboxRadiusRatio={item.hitboxRadiusRatio}
                                showHitBox={environmentStates.showHitBox}
                                modelAlignmentTop={item.modelAlignmentTop}
                                modelAlignmentLeft={item.modelAlignmentLeft}
                            ></Ball>
                            :
                            (item.type == "box" ?
                                <Box
                                    key={index}
                                    height={item.height}
                                    width={item.width}
                                    boxcolor={item.boxcolor}
                                    XCordinate={item.XCordinate}
                                    YCordinate={item.YCordinate}
                                    XVelocity={item.XVelocity}
                                    YVelocity={item.YVelocity}
                                    tilt = {item.tilt}
                                    gravity={item.gravity}
                                    isPlayer={item.isPlayer}
                                    srcImage={item.srcImage}
                                    hitboxWidthRatio={item.hitboxWidthRatio}
                                    hitboxHeightRatio={item.hitboxHeightRatio}
                                    showHitBox={environmentStates.showHitBox}
                                    modelAlignmentTop={item.modelAlignmentTop}
                                    modelAlignmentLeft={item.modelAlignmentLeft}
                                ></Box>
                                :
                                ""
                            )
                    ):""}
                    {!startGame? <div className="p-2 rounded text-xl" style={{backgroundColor: "green", position: "fixed", top: "50%", left: "50%"}} onClick={() => {setStartGame(true); setCurrentLevel(1);}}>
                    Start
                    </div>:""}
                </div>
                {coordinateCheckUpdate && coordinateCheck.map((coordinate, index) => {
                    return <div className="absolute rounded-full" key={index} style={{backgroundColor: coordinate[2] || "pink", width: "10px", height: "10px", bottom: coordinate[1]-5 + "px", left: coordinate[0]-5 + "px" }}></div>
                })}
            </div>
            <div className="fixed p-1 rounded cursor-pointer" style={{backgroundColor: "red", bottom: "10px", left: "1800px" }} onClick={() => {
                    allRenderedItems.forEach((item) => {
                        if(item.isPlayer)
                        console.log(item.ballcolor || item.boxcolor,item.type,"data", item,item.XCordinate, item.YVelocity, environmentStates.gravityAcceleration, currentLevel, lastLevel, frameIntervalObject);
                    })
                }}>Print Data</div>
        </>
    );
}