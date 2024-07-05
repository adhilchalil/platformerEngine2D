export default function ball({ballradius, ballcolor, XCordinate, YCordinate, XVelocity , gravity, isPlayer, frameCount}){
    return ( 
        <div
            className={"fixed rounded-full domItem" + (gravity? " gravity":"") + (isPlayer? " playercharacter":"")}
            style={{border: (isPlayer ?"0px" : "1px") + " solid black", backgroundColor: isPlayer ? "rgba(255, 0, 0, 0.0)": ballcolor, width: ballradius*2 + "px",height: ballradius*2 + "px", bottom: YCordinate+"px", left: XCordinate+"px"}}
        >{isPlayer && <img className={(XVelocity < 0 ? "imgflip " : "") + "imagecenter imageFrames"} style={{width: ballradius*2 + "px",height: ballradius*2 + "px"}} src={`/walk_cycle1.png`}/>}</div>  
    );
}