import Ball from "@/objects/ball";
import Box from "@/objects/box";
import allFrames from "@/physics/allPhysics";
import { playerControlsManager } from "@/itemControl/playermovement";
import { useEffect, useState } from "react";

const restrictedBoundary = Number(process.env.NEXT_PUBLIC_BOUNDARY_RESTRICTED)? true: false;
const groundheight = restrictedBoundary? Number(process.env.NEXT_PUBLIC_GROUNDHEIGHT) : 0;
const roomHeight = Number(process.env.NEXT_PUBLIC_ROOMHEIGHT);
const roomWidth = Number(process.env.NEXT_PUBLIC_ROOMWIDTH);
const gravityrate =  Number(process.env.NEXT_PUBLIC_GRAVITYRATE);

const environmentStates = {
    roomHeight : roomHeight,
    roomWidth : roomWidth,
    gravityrate : gravityrate,
    timeInterval : Number(process.env.NEXT_PUBLIC_SECOND_PER_FRAME),
    itemsMinimumVelocity : Number(process.env.NEXT_PUBLIC_MINIMUM_GROUND_VELOCITY),
    restrictedBoundary : restrictedBoundary,
    groundHeight : groundheight,
    maxYVelocity : Number(process.env.NEXT_PUBLIC_MAX_Y_VELOCITY),
    gravityAcceleration: gravityrate*0.01
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
    minDashDelay: Number(process.env.NEXT_PUBLIC_PLAYER_DASH_DELAY), //in millisec
    maxDashCount: Number(process.env.NEXT_PUBLIC_PLAYER_DASH_COUNT),
    minimumGroundVelocity: Number(process.env.NEXT_PUBLIC_PLAYER_MINIMUM_GROUND_VELOCITY),
    frameCount: 1
};

const playerStates = {
    jumpAvailable: true,
    dashCount: 1,
    lastDashTime: new Date()
};

const items = [
    {
        type: "ball",
        ballradius: 65, //pixels
        ballcolor:"red",
        XCordinate: 1000, //percentage
        YCordinate: 400, //percentage
        XVelocity: 2,
        YVelocity: 2,
        gravity: true,
        elasticity: 0.7,
        rigid: true,
    },
    {
        type: "box",
        height: 50,
        width: 150,
        tilt: 0,
        boxcolor:"green",
        XCordinate: 1200,
        YCordinate: 300,
        XVelocity: 0,
        YVelocity: 0,
        gravity: false,
        elasticity: 0.7,
        rigid: true,
    },
    {
        type: "box",
        height: 50,
        width: 150,
        boxcolor:"blue",
        tilt: 90,
        XCordinate: 400,
        YCordinate: 400,
        XVelocity: 0,
        YVelocity: 0,
        gravity: false,
        elasticity: 0.7,
        rigid: true,
    },
    {
        type: "ball",
        ballradius: 60,
        ballcolor:"red",
        XCordinate: 100,
        YCordinate: 100,
        XVelocity: 2,
        YVelocity: 0,
        gravity: true,
        elasticity: 0,
        isPlayer: true,
        rigid: false,
    }
];

export default function gravityroom(){
    const [coordinateCheckUpdate, setCoordinateCheckUpdate] = useState(1);

    //to refresh some non state data every few seconds using react state variables to force re-render.
    // const refreshData = setInterval(() => {
    //     setCoordinateCheckUpdate(coordinateCheckUpdate + 1);
    // }, 3000);

    useEffect(() => {
        allFrames(items, playerControls, playerSettings, playerStates, environmentStates, coordinateCheck);
        playerControlsManager(playerControls, playerStates);
    },[]);

    return ( 
        <>
            <div className="gravitycontainer fixed" style={{backgroundColor: "grey", height: 0.95*roomHeight + "px", width : roomWidth + "px", bottom: 0.05*roomHeight + "px" }}>
                {items.map((item,index) => 
                    item.type == "ball" ?
                        <Ball
                            key={index}
                            ballradius={item.ballradius}
                            ballcolor={item.ballcolor}
                            XCordinate={item.XCordinate}
                            YCordinate={item.YCordinate}
                            XVelocity={item.XVelocity}
                            gravity={item.gravity}
                            isPlayer={item.isPlayer}
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
                                tilt = {item.tilt}
                                gravity={item.gravity}
                                isPlayer={item.isPlayer}
                            ></Box>
                            :
                            ""
                        )
                )}
            </div>
            {restrictedBoundary?<div className="fixed gravitycontainer" style={{backgroundColor: "brown", borderTop: "3px solid black", height: groundheight + "px", width: roomWidth + "px", bottom: "0px" }}>
            </div>:""}
            <div className="fixed p-1 rounded cursor-pointer" style={{backgroundColor: "red", bottom: "10px", left: "1800px" }} onClick={() => {
                items.forEach((item) => {
                    if(item.isPlayer)
                    console.log(item.ballcolor || item.boxcolor,item.type,"data", item,item.XCordinate, item.YVelocity, environmentStates.gravityAcceleration);
                })
                
            }}>Print Data</div>
            {coordinateCheckUpdate && coordinateCheck.map((coordinate, index) => {
                return <div className="fixed rounded-full" key={index} style={{backgroundColor: coordinate[2] || "pink", width: "10px", height: "10px", bottom: coordinate[1]-5 + "px", left: coordinate[0]-5 + "px" }}></div>
            })}
        </>
    );
}