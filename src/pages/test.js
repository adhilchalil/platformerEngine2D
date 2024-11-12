import { useEffect, useState } from "react";

export default function test(){

const [sortTime, setSortTime] = useState(0);
const [totalCost, setTotalCost] = useState(0);
const [totalCost2, setTotalCost2] = useState(0);
const [totalTime, setTotalTime] = useState(0);
const [totalTime2, setTotalTime2] = useState(0);
let actualArr = Array.from(Array(100000), (_,x) => Math.floor(Math.random()*100));
// let actualArr = [30,20,10,40,50,33,67,67];

useEffect(() => {
    let cost = 0;
    let arr = [...actualArr];
    let timesort = window.performance.now();
    arr.sort((a,b) => a-b);
    setSortTime(window.performance.now() - timesort);
    let arr2 = [...arr];
    let time = window.performance.now();
    // while(arr.length > 1){
    //     arr.sort((a,b) => a-b);
    //     let sum = arr[0] + arr[1];
    //     cost += sum;
    //     arr.splice(0,2);
    //     arr.push(sum);
    // }
    setTotalTime(window.performance.now() - time);
    setTotalCost(cost);

    let cost2 = 0;
    let sumArray = [];
    let time2 = performance.now();
    let i = 0;
    let j = 0;
    let x = 1;
    while(i+j < (arr2.length+sumArray.length -1)){
        x++;
        let sum = 0;
        let num1;
        let num2;
        if(i >= arr2.length){
            num1 = sumArray[j];
            num2 = sumArray[j+1];
            j += 2; 
            // sumArray.splice(0,2);
        }
        else if(j >= sumArray.length){
            num1 = arr2[i];
            num2 = arr2[i+1];
            // arr2.splice(0,2);
            i += 2;
        }
        else if(arr2[i] < sumArray[j]) {
            num1 = arr2[i];
            if(arr2.length > 1 && arr2[i+1] < sumArray[j]) {
                num2 = arr2[i+1];
                i += 2;
                // arr2.splice(0,2);
            }
            else {
                num2 = sumArray[j];
                i++,j++;
                // arr2.splice(0,1);
                // sumArray.splice(0,1);
            }
        }
        else if(arr2[i] > sumArray[j]) {
            num1 = sumArray[j];
            if(sumArray.length > 1 && sumArray[j+1] < arr2[i]) {
                num2 = sumArray[j+1];
                j += 2;
                // sumArray.splice(0,2);
            }
            else {
                num2 = arr2[i];
                i++,j++;
                // arr2.splice(0,1);
                // sumArray.splice(0,1);
            }
        }
        else if(arr2[i] == sumArray[j]){
            num1 = arr2[i];
            num2 = sumArray[j];
            i++,j++;
            // arr2.splice(0,1);
            // sumArray.splice(0,1);
        }
        sum = num1 + num2; 
        cost2 += sum;
        sumArray.push(sum);
    }
    setTotalTime2(window.performance.now() - time2);

    setTotalCost2(cost2);
},[]);

return ( 
    <>
        <span className="text-xl" style={{cursor: "pointer"}}>sort time: {sortTime}</span><br></br>
        <span className="text-xl" style={{cursor: "pointer"}}>{totalTime} : {totalCost}</span><br></br>
        <span className="text-xl" style={{cursor: "pointer"}}>{totalTime2} : {totalCost2}</span>
    </>
);
}