import { useEffect, useState } from "react";

export default function test2(){

const [sortTime, setSortTime] = useState(0);
const [totalCost, setTotalCost] = useState(0);
const [output, setOutput] = useState(0);
const [totalTime, setTotalTime] = useState(0);
const [totalTime2, setTotalTime2] = useState(0);
let actualArr = [0,1,0,2,1,0];
// let actualArr = [30,20,10,40,50,33,67,67];

useEffect(() => {
    let leftMax = Array(actualArr.length);
    let rightMax = Array(actualArr.length);
    let size = actualArr.length;
    let waterTrapped=0;
    leftMax[0] = actualArr[0];
    rightMax[size-1] = actualArr[size - 1];
    for(let i=1; i<size; i++){
        leftMax[i] = Math.max(leftMax[i-1], actualArr[i]);
        rightMax[(size-1)-i] = Math.max(rightMax[size-i], actualArr[(size-1)-i]);
    }
    for(let i=0; i<size; i++){
        waterTrapped += Math.min(leftMax[i], rightMax[i]) - actualArr[i];
        console.log(waterTrapped);
    }
    
    setOutput(leftMax.join(",") + " | " + rightMax.join(",") + "=" + waterTrapped);
},[]);

return ( 
    <>
        <span className="text-xl" style={{cursor: "pointer"}}>sort time: {sortTime}</span><br></br>
        <span className="text-xl" style={{cursor: "pointer"}}>{totalTime} : {totalCost}</span><br></br>
        <span className="text-xl" style={{cursor: "pointer"}}>1 : {output}</span>
    </>
);
}