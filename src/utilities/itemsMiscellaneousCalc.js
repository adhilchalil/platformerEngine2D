export default function itemsMiscellaneousCalc(items) {
    items.forEach((item, index) => {
        if(item.type == "ball"){
            item.centreXCordinate = item.XCordinate + item.ballradius;
            item.centreYCordinate = item.YCordinate + item.ballradius;
        }
        else if(item.type == "box"){
            item.centreXCordinate = item.XCordinate + item.width;
            item.centreYCordinate = item.YCordinate + item.height;
        }
        
        if(item.lightSourceFlicker) {
            item.currentFlickerFrame = item.currentFlickerFrame? (item.currentFlickerFrame + 1)% item.lightSourceFlickerFrames: 1;
        }
    });
}