export default function box({height, width, boxcolor, XCordinate, YCordinate, gravity, isPlayer, tilt}){
    return ( 
        <div
            className={"fixed domItem" + (gravity? " gravity":"") + (isPlayer? " playercharacter":"")}
            style={{border: "1px solid black", borderRadius: "2%", transformOrigin: "bottom left", transform: `rotate(${-tilt}deg)` ,backgroundColor: boxcolor, width: width + "px", height: height + "px", bottom: YCordinate+"px", left: XCordinate+"px"}}
        ></div>  
    );
}