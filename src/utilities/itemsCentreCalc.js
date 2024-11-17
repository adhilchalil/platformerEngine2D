export default function itemsCentreCalc(items) {
    items.forEach((item, index) => {
        if(item.type == "ball"){
            item.centreXCordinate = item.XCordinate + item.ballradius;
            item.centreYCordinate = item.YCordinate + item.ballradius;
        }
        else if(item.type == "box"){
            item.centreXCordinate = item.XCordinate + item.width;
            item.centreYCordinate = item.YCordinate + item.height;
        }
    });
}