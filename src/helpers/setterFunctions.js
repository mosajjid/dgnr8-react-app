
import contracts from "../Config/contracts";
import { getNFTContract } from './getterFunctions'
import dgnr8ABI from '../Config/abis/dgnr8.json'
// import BigNumber from 'bignumber.js';

export const deploySimpleErc721 = async (name,symbol,imgLink,royalty) => {
    console.log("function is called");

    let cont=await getNFTContract(contracts.NFT,dgnr8ABI)

    if(cont){
        
        let res = await cont.deploySimpleERC721(name,symbol,imgLink,royalty);
        if(res){
            console.log("res is-------->",res.hash)
        }
       
        return res;
    }
    

}



