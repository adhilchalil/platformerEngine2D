import { Vidaloka } from "next/font/google";
import { useEffect, useState } from "react";

export default function test4(){

const [sortTime, setSortTime] = useState(0);
const [totalCost, setTotalCost] = useState(0);
const [output, setOutput] = useState(0);
const [totalTime, setTotalTime] = useState(0);
const [totalTime2, setTotalTime2] = useState(0);
let inputArr = [2,1,5,6,2,3];
// let inputArr = Array.from(Array(10), (_,x) => Math.floor(Math.random()*1000));
function nextSmaller(hist){
    const n = hist.length;

    // Initialize with n for the cases when next smaller
    // does not exist
    const nextS = new Array(n).fill(n);
    const stack = [];

    // Traverse all array elements from left to right
    for(let i=0; i< n; i++){
        while(stack.length && hist[i] < hist[stack[stack.length - 1]]){
            nextS[stack.pop()] = i;
        }
        stack.push(i);
    }
    return nextS;
}

// Function to find previous smaller for every element
function prevSmaller(hist)
{
    const n = hist.length;

    // Initialize with -1 for the cases when prev smaller
    // does not exist
    const prevS = new Array(n).fill(-1);
    const stack = [];

    // Traverse all array elements from left to right
    

    return prevS;
}

// Helper function to calculate the maximum rectangular
// area in the histogram
function getMaxArea(hist)
{
    const prevS = prevSmaller(hist);
    const nextS = nextSmaller(hist);
    let maxArea = 0;

    // Calculate the area for each histogram bar
    for (let i = 0; i < hist.length; i++) {
        const width = nextS[i] - prevS[i] - 1;
        const area = hist[i] * width;
        maxArea = Math.max(maxArea, area);
    }

    return maxArea;
}
useEffect(() => {


    setOutput(getMaxArea(inputArr));
},[]);

return ( 
    <>
        <span className="text-xl" style={{cursor: "pointer"}}>sort time: {sortTime}</span><br></br>
        <span className="text-xl" style={{cursor: "pointer"}}>{totalTime} : {totalCost}</span><br></br>
        <span className="text-xl" style={{cursor: "pointer"}}>1 : {output}</span>
    </>
);
}