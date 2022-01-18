import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react'
import { getContract } from './helpers/getterFunctions'
import { deploySimpleErc721 } from './helpers/setterFunctions'
import { connect } from "./helpers/currentWalletHelper"
import contracts from './Config/contracts'
import dgnr8ABI from "./Config/abis/dgnr8.json"
import simpleERC721ABI from './Config/abis/simpleERC721.json'
import marketplaceABI from './Config/abis/marketplace.json'
import { BigNumber } from 'ethers';

// import SignMessage from './SignMessage';


import { ethers } from 'ethers';


function App() {



  const [contract, setContract] = useState();
  const [mintAddress, setMintAddress] = useState(0);
  const [hash, setHash] = useState("")
  const [nftName, setNftName] = useState("")
  const [symbol,setSymbol]=useState("")
  const [imgLink,setImgLink]=useState("")
  const [royalty,setRoyalty]=useState(0)
  const [userSignature, setUserSignature] = useState([])
  const [account, setAccount] = useState()
  const [r, setR] = useState(0)


  const toTypedOrder = (
    userAddress, tokenAddress, id, quantity, listingType, paymentTokenAddress, valueToPay, deadline, bundleTokens, bundleTokensQuantity, salt
) => {
    const domain = {
        chainId: 80001,
        name: 'Decrypt Marketplace',
        verifyingContract:contracts.MARKETPLACE,
        version: '1',
    };

    const types = {
        Order: [
            { name: 'user', type: 'address' },
            { name: 'tokenAddress', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
            { name: 'quantity', type: 'uint256' },
            { name: 'listingType', type: 'uint256' },
            { name: 'paymentToken', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'bundleTokens', type: 'bytes32' },
            { name: 'salt', type: 'uint256' },
        ],
    };

    //hashing array of tokens IDs + array of tokens quantities
    //same as keccak256(abi.encodePacked( <array> ))
    let bundleTokensHash;
    if(bundleTokens.length === 0){
        bundleTokensHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
    }
    else{
        const typesArray = new Array(bundleTokens.length).fill('uint256');
        const indexHash = ethers.utils.solidityKeccak256(typesArray,bundleTokens);
        const arrayHash = ethers.utils.solidityKeccak256(typesArray,bundleTokensQuantity);
        bundleTokensHash = ethers.utils.solidityKeccak256(['bytes32','bytes32'],[indexHash,arrayHash]);
    }
    const TIME = Math.round(new Date()/1000 + 3600000);
    const value = {
        user: userAddress,
        tokenAddress: tokenAddress,
        tokenId: id,
        quantity: quantity,
        listingType: listingType,
        paymentToken:paymentTokenAddress,
        value:valueToPay,
        deadline: deadline,
        bundleTokens: bundleTokensHash,
        salt: salt,
    };

    return { domain, types, value };
}
  // var data = JSON.stringify({
  //   types: {
  //     EIP712Domain: domain,
  //     SellOrders: sellOrders,
  //   },
  //   domain: domainData,
  //   primaryType: "SellOrders",
  //   message: message
  // });

  const getSignature = async (signer,...args) => {
    const order = toTypedOrder(...args);
    let provider = new ethers.providers.Web3Provider(window.ethereum)

      const signer1 =  provider.getSigner()
      console.log("signer is------>",signer1)

    const signedTypedHash =  await signer1._signTypedData(
        order.domain,
        order.types,
        order.value
    );
    const sig = ethers.utils.splitSignature(signedTypedHash);

    return [sig.v, sig.r, sig.s];
}

const getHashedTypedData = async (...args) => {
  const order = toTypedOrder(...args)

  return ethers.utils._TypedDataEncoder.hash(
      order.domain,
      order.types,
      order.value
  );
}


  useEffect(async () => {
    let cont = await getContract(contracts.NFT, dgnr8ABI);
    setContract(cont)
    console.log("dddddd")
    // _buy()


    let acc = await connect();

    if (acc) {
      setAccount(acc[0])

      console.log("account is ------->", account)
    }

  }, [account])

  // const signMessage = async () => {
  //   try {
  //     console.log({ message });
  //     if (!window.ethereum)
  //       throw new Error("No crypto wallet found. Please install it.");


  //     let address = await connect()
  //     var r, s, v;
  //     let signauteResult = await window.web3.currentProvider.sendAsync({
  //       method: "eth_signTypedData_v4",
  //       params: [address[0], data],
  //       from: address[0]
  //     }, function (error, result) {
  //       if (error) {
  //         console.log(error)
  //       } else {
  //         const signature = result.result.substring(2);
  //         console.log("signature is ----->", signature)
  //         r = "0x" + signature.substring(0, 64);
  //         s = "0x" + signature.substring(64, 128);
  //         v = parseInt(signature.substring(128, 130), 16);
  //         console.log("r s and v is----->", r, s, v)
  //         let sig = [v, r, s];
  //         localStorage.setItem('sellerV',v)
  //         localStorage.setItem('sellerR',r)
  //         localStorage.setItem('sellerS',s)
  //         localStorage.setItem('Signature', sig);
  //         if (sig) {
            
  //         }

  //         return sig
  //       }
  //     });

  //     let sig = [r, s, v];

  //     return {
  //       r,
  //       s,
  //       v
  //     };
  //   } catch (err) {
  //     console.log("error is--->", err.message);
  //   }
  // };

  // const buyersignMessage = async () => {
  //   try {
  //     console.log({ message });
  //     if (!window.ethereum)
  //       throw new Error("No crypto wallet found. Please install it.");


  //     let address = await connect()
  //     var r, s, v;
  //     let signauteResult = await window.web3.currentProvider.sendAsync({
  //       method: "eth_signTypedData_v4",
  //       params: [address[0], data],
  //       from: address[0]
  //     }, function (error, result) {
  //       if (error) {
  //         console.log(error)
  //       } else {
  //         const signature = result.result.substring(2);
  //         console.log("signature is ----->", signature)
  //         r = "0x" + signature.substring(0, 64);
  //         s = "0x" + signature.substring(64, 128);
  //         v = parseInt(signature.substring(128, 130), 16);
        
  //         let sig=[{v: v},{r: r},{s: s}]
  //         console.log("v r and s is----->",sig)
         
  //         localStorage.setItem('buyerV',v)
  //         localStorage.setItem('buyerR',r)
  //         localStorage.setItem('buyerS',s)
  //         setUserSignature(sig)
  //         if (userSignature) {
  //           console.log("user signature----->", userSignature)
  //         }

  //         return sig
  //       }
  //     });

  //     let sig = [r, s, v];

  //     return {
  //       r,
  //       s,
  //       v
  //     };
  //   } catch (err) {
  //     console.log("error is--->", err.message);
  //   }
  // };


  const _deploySimpleErc721 = (async () => {
    console.log("functon is called in app");
    console.log(nftName,symbol,imgLink,royalty);
    let res = await deploySimpleErc721(nftName, symbol, imgLink, royalty);
    const TIME = Math.round(new Date()/1000 + 3600000);
    setHash(res)
    const sellerOrder = [
      "0x09b05f922a87e29874A6f04Cd809662daFCC2205","0x5c1D49BB2bab0440B2aE05C14782191ff5a72282",
      1,1,0,
      '0xED2411155E82aCc7e4Ce2d910c41aba36d7C99aB',
     "0000000000000000000" ,
     TIME,[],[],123
    ];
   
    let sellerSign=await getSignature(account,...sellerOrder);
         localStorage.setItem('sellerV',sellerSign[0])
            localStorage.setItem('sellerR',sellerSign[1])
            localStorage.setItem('sellerS',sellerSign[2])
    // localStorage.setItem("newSigner",sellerSign);

    console.log("seller sign is------->",sellerSign)


  })
  const readReceipt = (async () => {
    let provider = new ethers.providers.Web3Provider(window.ethereum)
    console.log("hash value is------->", hash)
    const receipt = await provider.getTransactionReceipt(hash);
    if (receipt) {
      setMintAddress(receipt.logs[0].address)
      console.log("mint contract address is----->", receipt.logs[0].address)
    }
    console.log(receipt.logs[0].address);


    return receipt.logs[0].address
    // console.log(log);
  })

  const _mint = (async () => {
    let maddress = await readReceipt()
    let res = await getContract(maddress, simpleERC721ABI.abi);

    if (res) {
      console.log("simple erc721 contract is------->", res)
    }

    console.log("mint address is---->", maddress)
    localStorage.setItem("NFT",maddress)
    if (maddress != 0) {
      setMintAddress(maddress)
    }
    let approval = await res.setApprovalForAll(contracts.MARKETPLACE, true);
    if (approval) {
      console.log("approval for marketplace", approval)
    } else {
      console.log("approval didnt happen");
    }

    let nftmint = await res.mint(account, 1)
   
    if (nftmint) {
      console.log("nft is minted", nftmint);
     
      
    }



  })

  const _buy=(async()=>{

    try{
      let marketPlaceContract=await getContract(contracts.MARKETPLACE,marketplaceABI.abi);
      console.log("marketplace contract is -------->",marketPlaceContract)
      
      let nft=localStorage.getItem('NFT')
      console.log("account and mintaddress is",account,nft);
    
      
      

      const TIME = Math.round(new Date()/1000 + 3600000);
      console.log("time is ------>",TIME)
      const sellerOrder = [
        "0x09b05f922a87e29874A6f04Cd809662daFCC2205","0x5c1D49BB2bab0440B2aE05C14782191ff5a72282",
        1,1,0,
        '0xED2411155E82aCc7e4Ce2d910c41aba36d7C99aB',
       "0" ,
       TIME,[],[],123
      ];

      const buyerOrder = [
        account, "0x5c1D49BB2bab0440B2aE05C14782191ff5a72282",
        1,1,0,
        '0xED2411155E82aCc7e4Ce2d910c41aba36d7C99aB',
       "0" ,
       TIME+10000,[],[],123
      ];
      console.log("seller is mk")
      let sellerV=localStorage.getItem('sellerV')
      sellerV=parseInt(sellerV);
      // sellerV=BigNumber.from(sellerV)

      let sellerR=localStorage.getItem('sellerR')
      let sellerS=localStorage.getItem('sellerS')

      let buyerV=localStorage.getItem('buyerV')
      // buyerV= BigNumber.from(buyerV)
      let buyerR=localStorage.getItem('buyerR')
      let buyerS=localStorage.getItem('buyerS')
      // let buySign=localStorage.getItem('buyerSignature');
      
      console.log("SellerOder",sellerOrder);
      console.log("buyerOder",buyerOrder);
     
      // console.log("buySign",buySign,ethers.utils.parseEther("1.0"));
    
    //  let sellerSign=await getSignature("0x09b05f922a87e29874A6f04Cd809662daFCC2205",...sellerOrder)
     let buySign=await getSignature(account,...buyerOrder);

     console.log("seller sign and buy sign",buySign)
      
      console.log("marketplace address",marketPlaceContract);
      const options = {
        from: account,
        gasPrice: 10000000000,
        gasLimit: 9000000,
        value: ethers.utils.parseEther("0")
      }

      


      // const web3 = new Web3(window.ethereum);

      // const cIns = new web3.eth.Contract(marketplaceABI, marketPlaceContract.address);

      // let completeOrder = await cIns.methods.completeOrder(sellerOrder,sellerSign,buyerOrder,buySign).send({from: account, value: ethers.utils.parseEther("0.01")});

      let completeOrder= await marketPlaceContract.completeOrder(sellerOrder,buySign,buyerOrder,buySign,options);
      console.log("complete order function is ------->",completeOrder)

     
    }catch(e){
      console.log("buy error is----->",e)
    }
  
  })



  return (
    <div className="App">





      <label>
        Name:
        <input type="text" name="name" onChange={(e)=>{
          console.log(e.target.value)
          setNftName(e.target.value)
        }} />
      </label>


      <label>
        Symbol:
        <input type="text" name="name" onChange={(e)=>{
          setSymbol(e.target.value)
        }} />
      </label>


      <label>
        image-link:
        <input type="text" name="name"
         onChange={(e)=>{
          setImgLink(e.target.value)
        }} />
      </label>


      <label>
        Royalty:
        <input type="text" name="name" 
        onChange={(e)=>{
          let no=e.target.value;
          no=parseInt(no)*100;
          console.log(
            "no is",no
          )
          setRoyalty(no)
        }}/>
      </label>


      <label>
        NFT Quantity:
        <input type="text" name="name" value={1}/>
      </label>



      <button onClick={() => {
        _deploySimpleErc721()
      }}>Deploy Simple ERC 721</button>

      <button onClick={() => {
        _mint()
      }}>Create NFT</button>

{/* <button onClick={() => {
        buyersignMessage();
      }}>Create Signature for buyer</button> */}


      <button onClick={() => {
        _buy()
      }}>Buy NFT</button>


    </div>
  );
}

export default App;
