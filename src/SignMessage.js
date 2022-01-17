import { useState, useRef } from "react";
import { ethers } from "ethers";
import contracts from "./Config/contracts";
import ErrorMessage from "./ErrorMessage";
import {connect} from "./helpers/currentWalletHelper"



var domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" }
];

var sellOrders = [
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
];

const domainData = {
  name: "DecryptMarketplace",
  version: "1",
  chainId: 80001,  //configurable
  verifyingContract: contracts.MARKETPLACE, //marketPlace Address
};


var message = {
  user: '0xD022311DAcaa30f8396cA9d2C4662a2eF083A1Dd',
  tokenAddress:'0x1F0Ad1F5280adF7AD971c0f911Cc1F7A882033C5',
  tokenId: '1',
  quantity: '1',
  listingType: '0',
  paymentToken: '0x0000000000000000000000000000000000000000',
  value: '1000000000000000000',
  deadline: '1639048490',
  bundleTokens: '0x0000000000000000000000000000000000000000000000000000000000000000',
  salt: '123',
};

var data = JSON.stringify({
  types: {
      EIP712Domain: domain,
      SellOrders: sellOrders,
  },
  domain: domainData,
  primaryType: "SellOrders",
  message: message
});


const signMessage = async () => {
  try {
    console.log({ message });
    if (!window.ethereum)
      throw new Error("No crypto wallet found. Please install it.");

    await window.ethereum.send("eth_requestAccounts");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let address=await connect()
    var r,s,v;
    await window.web3.currentProvider.sendAsync({
    method: "eth_signTypedData_v4",
    params: [address[0], data],
    from: address
  }, function(error, result) {
    if (error) { 
      console.log(error)
    } else {
      const signature = result.result.substring(2);
       r = "0x" + signature.substring(0, 64);
       s = "0x" + signature.substring(64, 128);
       v = parseInt(signature.substring(128, 130), 16);
       console.log("r s and v is----->",r,s,v)
    }
  });
  let sig = [r, s, v];
 if(sig){
   return sig;
 }
console.log("signature is ------->",sig)
    return {
      r,
      s,
      v
    };
  } catch (err) {
    console.log("error is--->",err.message);
  }
};

export default function SignMessage() {
  const resultBox = useRef();
  const [signatures, setSignatures] = useState([]);
  const [error, setError] = useState();

  const handleSign = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setError();
    const sig = await signMessage();
    if (sig) {
      setSignatures([...signatures, sig]);
      console.log("signature is------->",sig);
      localStorage.setItem('Signature', sig.signature);
    }
  };

  return (
    <form className="m-4" onSubmit={handleSign}>
      <div className="credit-card w-full shadow-lg mx-auto rounded-xl bg-white">
        <main className="mt-4 p-4">
          <h1 className="text-xl font-semibold text-gray-700 text-center">
            {/* Sign messages */}
          </h1>
          <div className="">
            <div className="my-3">
              
            </div>
          </div>
        </main>
        <footer className="p-4">
          <button
            type="submit"
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Sign message
          </button>
          <ErrorMessage message={error} />
        </footer>
        {signatures.map((sig, idx) => {
          return (
            <div className="p-2" key={sig}>
              <div className="my-3">
                
                <p>Signer: {sig.v}</p>
                {/* <textarea
                  type="text"
                  readOnly
                  ref={resultBox}
                  className="textarea w-full h-24 textarea-bordered focus:ring focus:outline-none"
                  placeholder="Generated signature"
                  value={sig.signature}
                /> */}
              </div>
            </div>
          );
        })}
      </div>
    </form>
  );
}
