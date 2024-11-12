import { Vidaloka } from "next/font/google";
import { useEffect, useState } from "react";

export default function test3(){

const [sortTime, setSortTime] = useState(0);
const [totalCost, setTotalCost] = useState(0);
const [output, setOutput] = useState(0);
const [totalTime, setTotalTime] = useState(0);
const [totalTime2, setTotalTime2] = useState(0);
// let inputArr = [100,4,200,1,3,2,6, 9, 8, 7, 10, 12, 13];
let inputArr = Array.from(Array(10), (_,x) => Math.floor(Math.random()*1000));

useEffect(() => {
    let numExists = {};
    for(let h of inputArr){
        if(!numExists[h]){
            numExists[h] = {next: false, prev: false};
        }
    }

    for(let value of Object.entries(numExists)){
        if(numExists[Number(value[0])+1]){
            value[1].next = true;
        }
        if(numExists[Number(value[0])-1]){
            value[1].prev = true;
        }
    }
    let consecutiveCount = 0;
    
    for(let value of Object.entries(numExists)){
        if(numExists[value[0]].prev == false){
            let count = 1;
            let j=Number(value[0]);
            while(numExists[j]?.next){
                count++;
                j++;
            }
            if(consecutiveCount < count){
                consecutiveCount = count;
            }
        }
    }

    setOutput(consecutiveCount);
},[]);

return ( 
    <>
        <span className="text-xl" style={{cursor: "pointer"}}>sort time: {sortTime}</span><br></br>
        <span className="text-xl" style={{cursor: "pointer"}}>{totalTime} : {totalCost}</span><br></br>
        <span className="text-xl" style={{cursor: "pointer"}}>1 : {output}</span>
    </>
);
}