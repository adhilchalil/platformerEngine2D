export default function ball({ballradius, ballcolor, XCordinate, YCordinate, XVelocity, YVelocity,  gravity, isPlayer, srcImage, hitboxRadiusRatio, showHitBox, showBorder, modelAlignmentTop, modelAlignmentLeft}){
    return ( 
        <div
            className={"absolute rounded-full domItem overflow-visible" + (gravity? " gravity":"") + (isPlayer? " playercharacter":"") + (isPlayer && XVelocity < 0 ? " imgflip" : "")}
            style={{border: (showHitBox || showBorder ? "1px" : "0px") + " solid black", backgroundColor: ballcolor || showHitBox? (ballcolor || "rgba(255, 0, 0, 0.3)") : "rgba(255, 0, 0, 0)", width: ballradius*2 + "px",height: ballradius*2 + "px", bottom: YCordinate+"px", left: XCordinate+"px"}}
        >
            {(isPlayer || srcImage) &&
                <img
                    className={ "imagecenter" + (isPlayer? " imageFrames" : "")}
                    style={{  transform: "scale(" + hitboxRadiusRatio +")",width: ballradius*2 + "px", height: ballradius*2 + "px", top: `${modelAlignmentTop? modelAlignmentTop : 50}` + "%", left: `${modelAlignmentLeft? modelAlignmentLeft: 50}` + "%"}}
                    src={`${srcImage}`}
                />
            }
        </div>  
    );
}