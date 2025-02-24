import Ball from "@/objects/ball";
import Box from "@/objects/box";
import allFrames from "@/physics/allPhysics";
import { playerControlsManager } from "@/itemControl/playermovement";
import { useEffect, useState } from "react";

var frameIntervalObject = null;
var allRenderedItems = [];
var levelTransitionData = {};
var levelProperties = {};

if(frameIntervalObject){
    clearInterval(frameIntervalObject);
}

const restrictedBoundary = Number(process.env.NEXT_PUBLIC_BOUNDARY_RESTRICTED)? true: false;
const groundheight = Number(process.env.NEXT_PUBLIC_GROUNDHEIGHT);
const roomHeight = Number(process.env.NEXT_PUBLIC_ROOMHEIGHT);
const roomWidth = Number(process.env.NEXT_PUBLIC_ROOMWIDTH);
const gravityrate =  Number(process.env.NEXT_PUBLIC_GRAVITYRATE);

const defaultEnvBackground = {
    backgroundColor: "grey",
    backgroundImage: "none",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    backgroundSize: "cover",
}
const environmentDesigns = {
    backgroundColor: "grey",
    backgroundImage: "url('2d_platformer_background_desert.jpg')",
    backgroundRepeat: "round",
    backgroundAttachment: "fixed",
    backgroundSize: "cover",
};

const lightSources = {
    fixedLightSources: [],
    updatingLightSources: []
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
};

const playerStates = { //initial
    jumpAvailable: false,
    dashCount: 0,
    nextDashTime: new Date(),
    lastJumpableCollisionTime: new Date(),
    lastjumpableCollisionAngle: Math.PI/2,
};

const playerInputHistory = {
    lastLeft: new Date(),
    lastRight: new Date(),
    lastDownward: new Date(),
    lastUpward: new Date(),
}

const playerItems= [
    {
        type: "ball",
        ballradius: 40,
        // ballcolor: "rgba(255, 0, 0, 0.2)",
        XCordinate: 100,
        YCordinate: 300,
        XVelocity: 2,
        YVelocity: 0,
        gravity: true,
        elasticity: 0,
        isPlayer: true,
        rigid: false,
        srcImage: "/slime_animate.gif",
        idleFrameCount: 1,
        walkFramesSrc: "/walk_cycle.png",
        walkFrameCount: 0,
        jumpFramesSrc: "/slime_jump_up.png",
        jumpFrameCount: 1,
        fallFrameSrc: "/slime_jump_down.png",
        fallFrameCount: 1,
        modelAlignmentTop: 54,
        modelAlignmentLeft: 43,
        hitboxRadiusRatio: 1.4,
        disableVelocityDecay: false,
        lightSource: true,
        lightSourceRadius: 400
    }];

function animationSrcFormatter(item, title, formattitle, sourceformat){
    const playerAnimationTitle = sourceformat.split(".");

    const playerAnimationFormat = playerAnimationTitle.pop();

    item[`${title}`] = playerAnimationTitle.join(".");

    item[`${formattitle}`] = playerAnimationFormat;
};

animationSrcFormatter(playerItems[0], "playerIdleAnimationTitle", "playerIdleAnimationFormat", playerItems[0].srcImage);

animationSrcFormatter(playerItems[0], "playerWalkAnimationTitle", "playerWalkAnimationFormat", playerItems[0].walkFramesSrc);

animationSrcFormatter(playerItems[0], "playerJumpAnimationTitle", "playerJumpAnimationFormat", playerItems[0].jumpFramesSrc);

animationSrcFormatter(playerItems[0], "playerFallAnimationTitle", "playerFallAnimationFormat", playerItems[0].fallFrameSrc);

const allLevelData = [
    // level 1
    {
        levelProperties: {
            height: roomHeight*2,
            width: roomWidth*1.5,
            offsetRight: 0,
            offsetLeft: 0,
            offsetUp: 0,
            offsetDown: 0,
            night: true
        },
        levelTransitions: {
            up: null,
            down: null,
            left: null,
            right: 2
        },
        levelRespawns: {
            default: [100, 100],
            up: [100, 100],
            down: [100, 100],
            left: [100, 100],
            right: [2100, 100, 0.1],
        },
        levelItems:
            [
                {
                    type: "box",
                    height: groundheight,
                    width: 1.5*roomWidth,
                    tilt: 0,
                    boxcolor: "#8B4513",
                    showBorder: true,
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
                    height: 80,
                    width: 80,
                    tilt: 0,
                    content: '<-',
                    textStyles: {
                        color: 'white',
                        fontSize: "44px",
                        fontWeight:" 700",
                    },
                    boxcolor: "rgba(0,0,0,0.4)",
                    showBorder: true,
                    XCordinate: 200,
                    YCordinate: 200,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    noCollision: true,
                },
                {
                    type: "box",
                    height: 80,
                    width: 80,
                    tilt: 0,
                    content: '->',
                    textStyles: {
                        color: 'white',
                        fontSize: "44px",
                        fontWeight:" 700",
                    },
                    boxcolor: "rgba(0,0,0,0.4)",
                    showBorder: true,
                    XCordinate: 300,
                    YCordinate: 200,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    noCollision: true,
                },
                {
                    type: "box",
                    height: 80,
                    width: 300,
                    tilt: 0,
                    content: 'Space',
                    textStyles: {
                        color: 'white',
                        fontSize: "44px",
                        fontWeight:" 600",
                    },
                    boxcolor: "rgba(0,0,0,0.4)",
                    showBorder: true,
                    XCordinate: 600,
                    YCordinate: 200,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    noCollision: true,
                },
                {
                    type: "box",
                    height: 70,
                    width: 800,
                    tilt: 0,
                    showBorder: true,
                    boxcolor: "skyblue",
                    XCordinate: 800,
                    YCordinate: 60,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                },
                {
                    type: "box",
                    height: 80,
                    width: 80,
                    tilt: 0,
                    content: '<-',
                    textStyles: {
                        color: 'white',
                        fontSize: "44px",
                        fontWeight:" 700",
                    },
                    boxcolor: "rgba(0,0,0,0.4)",
                    showBorder: true,
                    XCordinate: 1100,
                    YCordinate: 300,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    noCollision: true,
                },
                {
                    type: "box",
                    height: 80,
                    width: 80,
                    tilt: 0,
                    content: '->',
                    textStyles: {
                        color: 'white',
                        fontSize: "44px",
                        fontWeight:" 700",
                    },
                    boxcolor: "rgba(0,0,0,0.4)",
                    showBorder: true,
                    XCordinate: 1300,
                    YCordinate: 300,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    noCollision: true,
                },
                {
                    type: "box",
                    height: 80,
                    width: 80,
                    tilt: 90,
                    content: '->',
                    textStyles: {
                        color: 'white',
                        fontSize: "44px",
                        fontWeight:" 700",
                    },
                    boxcolor: "rgba(0,0,0,0.4)",
                    showBorder: true,
                    XCordinate: 1280,
                    YCordinate: 400,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    noCollision: true,
                },
                {
                    type: "box",
                    height: 80,
                    width: 80,
                    tilt: 90,
                    content: '<-',
                    textStyles: {
                        color: 'white',
                        fontSize: "44px",
                        fontWeight:" 700",
                    },
                    boxcolor: "rgba(0,0,0,0.4)",
                    showBorder: true,
                    XCordinate: 1280,
                    YCordinate: 300,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    noCollision: true,
                },
                {
                    type: "box",
                    height: 80,
                    width: 80,
                    tilt: 0,
                    content: '+',
                    textStyles: {
                        color: 'black',
                        fontSize: "44px",
                        fontWeight:" 800",
                    },
                    boxcolor: "rgba(0,0,0,0)",
                    showBorder: false,
                    XCordinate: 1385,
                    YCordinate: 300,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    noCollision: true,
                },
                {
                    type: "box",
                    height: 80,
                    width: 150,
                    tilt: 0,
                    content: 'Shift',
                    textStyles: {
                        color: 'white',
                        fontSize: "44px",
                        fontWeight:" 600",
                    },
                    boxcolor: "rgba(0,0,0,0.4)",
                    showBorder: true,
                    XCordinate: 1470,
                    YCordinate: 300,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    noCollision: true,
                },
                {
                    type: "box",
                    height: 250,
                    width: 300,
                    tilt: 0,
                    showBorder: true,
                    boxcolor: "skyblue",
                    XCordinate: 1900,
                    YCordinate: 60,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                },
                // {
                //     type: "box",
                //     height: 100,
                //     width: 200,
                //     // boxcolor: "rgba(255, 0, 0, 0.2)",
                //     tilt: 0,
                //     XCordinate: 400,
                //     YCordinate: 400,
                //     XVelocity: 0,
                //     YVelocity: 0,
                //     gravity: false,
                //     elasticity: 0,
                //     rigid: true,
                //     srcImage: "/platform2.png",
                //     hitboxWidthRatio: 1.1,
                //     modelAlignmentTop: 51,
                //     hitboxHeightRatio: 1.5
                // }
            ]
    },
    // level 2
    {
        levelProperties: {
            height: roomHeight*2,
            width: roomWidth*1.2,
            offsetRight: 0,
            offsetLeft: 0,
            offsetUp: 0,
            offsetDown: 0,
            night: false
        },
        levelTransitions: {
            up: null,
            down: null,
            left: 1,
            right: 3
        },
        levelRespawns: {
            default: [100, 100],
            up: [100, 100],
            down: [100, 100],
            left: [100, 100],
            right: [2100, 100, 0.1],
        },
        levelItems:
            [
                {
                    type: "box",
                    height: groundheight,
                    width: 1.2*roomWidth,
                    tilt: 0,
                    boxcolor: "#8B4513",
                    showBorder: true,
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
                    lightSource: true,
                    lightSourceRadius: 500, 
                    hitboxWidthRatio: 1.8,
                    hitboxHeightRatio: 2.1,
                    modelAlignmentTop: 20,
                    modelAlignmentLeft: 47,
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
                    YCordinate: 50,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    srcImage: "/fire.gif",
                    lightSource: true,
                    lightSourceRadius: 500,
                    hitboxWidthRatio: 1.8,
                    hitboxHeightRatio: 2.1,
                    modelAlignmentTop: 20,
                    modelAlignmentLeft: 47,
                    deathZone: true
                },
                {
                    type: "box",
                    height: 50,
                    width: 50,
                    tilt: 0,
                    // boxcolor: "rgba(255, 255, 0, 0.2)",
                    // boxcolor: "#777513",
                    XCordinate: 1350,
                    YCordinate: 50,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    srcImage: "/fire.gif",
                    lightSource: true,
                    lightSourceRadius: 500,
                    hitboxWidthRatio: 1.8,
                    hitboxHeightRatio: 2.1,
                    modelAlignmentTop: 20,
                    modelAlignmentLeft: 47,
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
                    modelAlignmentTop: 51,
                    hitboxHeightRatio: 1.5
                }
            ]
    },
    // level 3
    {
        levelProperties: {
            height: roomHeight,
            width: roomWidth*1.5,
            night: true,
        },
        levelTransitions: {
            up: null,
            down: null,
            left: 2,
            right: 4
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
                    height: 750,
                    width: 200,
                    tilt: 20,
                    // boxcolor: "purple",
                    styles: {
                        backgroundImage: "url('rock texture.jpg')",
                        backgroundRepeat: "repeat",
                        backgroundSize: "400px 400px",
                    },
                    showBorder: true,
                    XCordinate: 1600,
                    YCordinate: -40,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                },
                {
                    type: "box",
                    height: groundheight,
                    width: roomWidth*1.5,
                    tilt: 0,
                    boxcolor: "#8B4513",
                    styles: {
                        backgroundImage: "url('rock texture.jpg')",
                        backgroundRepeat: "repeat",
                        backgroundSize: "400px 400px",
                    },
                    showBorder: true,
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
                    height: 200,
                    width: 300,
                    tilt: 0,
                    boxcolor: "purple",
                    showBorder: true,
                    XCordinate: 400,
                    YCordinate: 60,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: true,
                    elasticity: 0.5,
                    rigid: true,
                },
                {
                    type: "box",
                    height: 50,
                    width: 50,
                    tilt: 0,
                    // boxcolor: "rgba(255, 255, 0, 0.2)",
                    // boxcolor: "#777513",
                    XCordinate: 1800,
                    YCordinate: 50,
                    XVelocity: 0,
                    YVelocity: 0,
                    gravity: false,
                    elasticity: 0,
                    rigid: true,
                    srcImage: "/fire.gif",
                    lightSource: true,
                    lightSourceRadius: 1000,
                    lightSourceFlicker: true,
                    lightFlickerRadiusChange: 10,
                    lightSourceFlickerFrames: 100, 
                    hitboxWidthRatio: 1.8,
                    hitboxHeightRatio: 2.1,
                    modelAlignmentTop: 20,
                    modelAlignmentLeft: 47,
                    deathZone: true
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
                // {
                //     type: "box",
                //     height: 100,
                //     width: 200,
                //     // boxcolor: "rgba(255, 0, 0, 0.2)",
                //     tilt: 0,
                //     XCordinate: 400,
                //     YCordinate: 400,
                //     XVelocity: 0,
                //     YVelocity: 0,
                //     gravity: false,
                //     elasticity: 0,
                //     rigid: true,
                //     srcImage: "/platform2.png",
                //     modelAlignmentTop: 51,
                //     hitboxWidthRatio: 1.1,
                //     hitboxHeightRatio: 1.5
                // }
            ]
    },
    // level 4
    {
        levelProperties: {
            height: roomHeight,
            width: roomWidth,
            backGround: {
                backgroundColor: "grey",
                backgroundImage: "url('2d_platformer_background_desert.jpg')",
                backgroundRepeat: "round",
                backgroundAttachment: "fixed",
                backgroundSize: "cover",
            }
        },
        levelTransitions: {
            up: 4,
            down: 4,
            left: 3,
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
                showBorder: true,
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
                showBorder: true,
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
                showBorder: true,
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
                showBorder: true,
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
        lightSources.fixedLightSources = allLevelData[nextLevel-1].levelItems.filter((item) => item.lightSource && item.rigid && !item.lightSourceFlicker);
        let updatingLightSources1 = allLevelData[nextLevel-1].levelItems.filter((item) => (item.lightSource && item.lightSourceFlicker));
        let updatingLightSources2 = playerItems.filter((item) => (item.lightSource));
        lightSources.updatingLightSources = [...updatingLightSources1, ...updatingLightSources2];
        setLastLevel(currentLevel);
        setCurrentLevel(nextLevel);
    };

    const playerDeathAnimation = () => {
        // we do this soon
    };

    const playerLocationReset = () => {

        let levelTransitionKey = "default";

        for (const [key, value] of Object.entries(allLevelData[currentLevel-1].levelTransitions)) {
            if(value == lastLevel){
                levelTransitionKey = key;
            }
        }

        let respawnPoints = allLevelData[currentLevel-1].levelRespawns? allLevelData[currentLevel-1].levelRespawns:{
            default: [100, 100],
            up: [100, 100],
            down: [100, 100],
            left: [100, 100],
            right: [1000, 100, 0.1],
        };

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
                let DomItems = document.getElementsByClassName("domItem");
                let DOMplayerCharacter = document.getElementsByClassName("playercharacter");
                let lightingElement = document.getElementById("lightingContainer");
                let playerCharacterImage = document.getElementsByClassName("imageFrames");
                let cameraFrame = document.getElementsByClassName("cameraFrame")[0];
                let DOMElements = {
                    lightingElement: lightingElement,
                    DomItems: DomItems,
                    DOMplayerCharacter: DOMplayerCharacter,
                    playerCharacterImage: playerCharacterImage,
                    cameraFrame: cameraFrame
                }

                //presetting light radius to initialize root variable.
                // document.documentElement.style.setProperty('--lightRadius', 0 + "px");

                setTimeout(() => {
                    frameIntervalObject = allFrames(frameIntervalObject, allRenderedItems, levelTransitionData, levelProperties, playerControls, playerSettings, playerStates, playerInputHistory, environmentStates, coordinateCheck, currentLevel, levelTransitionTracking, reloadLevelItems, setReloadLevelItems, playerDeathHandler, DOMElements);
                    playerControlsManager(playerControls, playerStates, playerInputHistory);
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
            <div className="gravitycontainer cameraFrame fixed mx-auto rounded-md item"
                style={{
                    height: roomHeight + "px",
                    width: roomWidth + "px",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    overflow: "scroll"
                }}
            >
                <div className={`${startGame && levelProperties.night?"lightingContainer": ""} absolute`} style={{
                        ...environmentDesigns,
                        height: levelProperties.height + "px",
                        width : levelProperties.width + "px",
                        overflow: "hidden"
                    }}
                >
                {/* try masked svgs */}
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
                                showBorder={item.showBorder}
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
                                    showBorder={item.showBorder}
                                    modelAlignmentTop={item.modelAlignmentTop}
                                    modelAlignmentLeft={item.modelAlignmentLeft}
                                    content={item.content}
                                    textStyles={item.textStyles}
                                    styles={item.styles}
                                ></Box>
                                :
                                ""
                            )
                    ):""}
                    {!startGame? <div className="px-5 hidden lg:block py-2 button-34 rounded text-4xl text-bold font-bold" style={{ position: "fixed", top: "50%", left: "50%"}} onClick={() => {setStartGame(true); levelTransitionTracking(1);}}>
                    Start
                    </div>:""}
                </div>
                {coordinateCheckUpdate && coordinateCheck.map((coordinate, index) => {
                    return <div className="absolute rounded-full" key={index} style={{backgroundColor: coordinate[2] || "pink", width: "10px", height: "10px", bottom: coordinate[1]-5 + "px", left: coordinate[0]-5 + "px" }}></div>
                })}
                {currentLevel && levelProperties.night?
                <svg className={`${startGame && !playerDeath && levelProperties.night?"lightingContainer": ""} absolute`} style={{
                        height: levelProperties.height + "px",
                        width : levelProperties.width + "px",
                    }}
                >
                    <rect x="0" y="0" width={levelProperties.width + 1} height={levelProperties.height + 1} mask="url(#fullcover)"/>
                    <defs>
                        <mask id="fullcover">
                            <radialGradient id="myGradient">
                                <stop offset="0%" stopColor="rgba(0,0,0,1)" />
                                <stop offset="80%" stopColor="rgba(0,0,0,1)" />
                                <stop offset="90%" stopColor="rgba(0,0,0,0.5)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                            </radialGradient>
                            <rect width="100%" height="100%" fill="rgba(256,256,256,0.95)"/>

                            {lightSources.fixedLightSources?.map((source, index) => 
                                <circle id={"fixed" + currentLevel +"light" + index} key={"fixed" + currentLevel +"light" + index} r={source.lightSourceRadius} cx={source.XCordinate} cy={levelProperties.height - source.YCordinate} fill="url('#myGradient')"/>
                            )}

                            {lightSources.updatingLightSources?.map((source, index) => 
                                <circle id={"updating" + currentLevel +"light" + index} key={"updating" + currentLevel +"light" + index} className='updatingLightSource' r={source.lightSourceRadius} cx={source.XCordinate} cy={levelProperties.height - source.YCordinate} fill="url('#myGradient')"/>
                            )}

                        </mask>
                    </defs>

                </svg>
                :""}
            </div>
            <div className="block p-2 lg:hidden rounded text-xl text-bold font-bold" style={{ position: "fixed", top: "50%"}}>
                This being a game engine currently for large screens requires keyboard input.
            </div>
            {/* hidden resources to cache and prevent reload from server */}
            <div className="hidden">

                {/* player Images caching  */}
                {[...playerItems].map((item, playerIndex) => {
                    let AllPlayerImages = [];
                    ["Walk", "Jump", "Fall","Idle"].map((type, index) => 
                        {[...Array(item[`${type.toLowerCase()}FrameCount`])].map((val, i) => {
                            if(item[`${type.toLowerCase()}FrameCount`]){
                                AllPlayerImages.push(
                                    <img key={"hidden" + playerIndex + val + i + "resource" + index} src={playerItems[0][`player${type}AnimationTitle`] + (i + 1) + "." + playerItems[0][`player${type}AnimationFormat`]}></img>
                                );      
                            }
                        })}
                    )
                    item.srcImage? AllPlayerImages.push(<img key={"hiddenImageLevelItems" + playerIndex} src={item.srcImage}></img>):"";
                    return <>
                        {AllPlayerImages.map((htmlObj) => htmlObj)}
                    </>;
                })}

                {/* levelItems Caching */}
                {[...allLevelData].map((levelData, levelIndex) => {
                    let AllLevelImages = [];
                    levelData.levelItems.map((item, i) => {
                        ["Walk", "Jump", "Fall","Idle"].map((type, index) => 
                            {[...Array(item[`${type.toLowerCase()}FrameCount`])].map((val, i) => {
                                if(item[`${type.toLowerCase()}FrameCount`]){
                                    AllLevelImages.push(
                                        <img key={"hidden" + levelIndex + "level" + val + i + "resource" + index} src={item[`player${type}AnimationTitle`] + (i + 1) + "." + item[`player${type}AnimationFormat`]}></img>
                                    );      
                                }
                            })}
                        )
                        item.srcImage? AllLevelImages.push(<img key={"hiddenImage" + levelIndex + "LevelItems" + i} src={item.srcImage}></img>):"";
                        item.styles?.backgroundImage? AllLevelImages.push(<img key={"hiddenImage" + levelIndex + "BgLevelItems" + i} src={item.styles.backgroundImage.split("'")[1]}></img>):"";
                    })
                    return <>{AllLevelImages.map((htmlObj) => htmlObj)}</>;
                })}
            </div>
            {/* <div className="fixed p-1 rounded cursor-pointer" style={{backgroundColor: "red", bottom: "10px", left: "1800px" }} onClick={() => {
                    allRenderedItems.forEach((item) => {
                        if(item.isPlayer)
                        console.log(item.ballcolor || item.boxcolor,item.type,"data", item,item.XCordinate, item.YVelocity, environmentStates.gravityAcceleration, currentLevel, lastLevel, frameIntervalObject);
                    })
                }}>Print Data</div> */}
        </>
    );
}