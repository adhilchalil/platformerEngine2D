import { useEffect, useState } from "react";

export default function test(){

const [totalCost, setTotalCost] = useState(10);
let actualArr = [30,15,25];

useEffect(() => {
    let cost = 0;
    let arr = [...actualArr];
    arr.sort((a,b) => a-b);
    while(arr.length > 1){
        let sum = arr[0] + arr[1];
        cost += sum;
        console.log(arr[0] , arr[1], sum)
        arr.splice(0,2);
        let index = arr.findIndex((ele) => ele > sum);
        console.log(index)
        arr.splice(index, 0, sum);  
    }
    console.log(cost)
    setTotalCost(cost);
},[]);

return ( 
    <>
        <span style={{cursor: "pointer"}}>{totalCost}</span>
    </>
);
}