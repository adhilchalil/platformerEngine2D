export default function ball({ballradius, ballcolor, XCordinate, YCordinate, XVelocity , gravity, isPlayer, srcImage, hitboxRadiusRatio, showHitBox, modelAlignmentTop, modelAlignmentLeft}){
    return ( 
        <div
            className={"fixed rounded-full domItem overflow-visible" + (gravity? " gravity":"") + (isPlayer? " playercharacter":"")}
            style={{border: (isPlayer ? "0px" : "1px") + " solid black", backgroundColor: ballcolor || showHitBox? (ballcolor || "rgba(255, 0, 0, 0.3)") : "rgba(255, 0, 0, 0)", width: ballradius*2 + "px",height: ballradius*2 + "px", bottom: YCordinate+"px", left: XCordinate+"px"}}
        >
            {(isPlayer || srcImage) &&
                <img
                    className={ "imagecenter" +(isPlayer && XVelocity < 0 ? " imgflip" : "") + (isPlayer? " imageFrames" : "")}
                    style={{width: ballradius*2*(hitboxRadiusRatio? hitboxRadiusRatio: 1) + "px", height: ballradius*2*(hitboxRadiusRatio? hitboxRadiusRatio: 1) + "px", top: `${modelAlignmentTop? modelAlignmentTop : 50}` + "%", left: `${modelAlignmentLeft? modelAlignmentLeft: 50}` + "%"}}
                    src={`${srcImage}`}
                />
            }
        </div>  
    );
}