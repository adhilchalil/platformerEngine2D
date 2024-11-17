export default function box({height, width, boxcolor, XCordinate, YCordinate, XVelocity, YVelocity, gravity, isPlayer, tilt, srcImage, hitboxWidthRatio, hitboxHeightRatio, showHitBox, showBorder, modelAlignmentTop, modelAlignmentLeft}){
    return ( 
        <div
            className={"absolute domItem overflow-visible" + (gravity? " gravity":"") + (isPlayer? " playercharacter":"")}
            style={{border: (showHitBox || showBorder ? "1px" : "0px") + " solid black", borderRadius: "2%", transformOrigin: "bottom left", transform: `rotate(${-tilt}deg)` ,backgroundColor: boxcolor || showHitBox? (boxcolor || "rgba(255, 0, 0, 0.3)") : "rgba(255, 0, 0, 0)", width: width + "px", height: height + "px", bottom: YCordinate+"px", left: XCordinate+"px"}}
        >
            {(isPlayer || srcImage) && 
                <img
                    className={"imagecenter"  + (isPlayer && XVelocity < 0 ? " imgflip" : "") +  (isPlayer? " imageFrames" : "")}
                    style={{width: width*hitboxWidthRatio + "px", height: height*hitboxHeightRatio + "px", top: `${modelAlignmentTop? modelAlignmentTop : 50}` + "%", left: `${modelAlignmentLeft? modelAlignmentLeft: 50}` + "%"}}
                    src={`${srcImage}`}
                />
            }
        </div>  
    );
}