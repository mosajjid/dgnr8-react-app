import MetaMaskOnboarding from "@metamask/onboarding";
import { recoverTypedSignature_v4 as recoverTypedSignatureV4 } from 'eth-sig-util';
// import { recoverTypedSignature_v4 as recoverTypedSignatureV4 } from '@metamask/eth-sig-util';
//import "./resolve_fallback";
import React, {useState, useEffect} from 'react';
// import {Button, InputGroup, FormControl} from 'react-bootstrap';

import { ethers } from 'ethers';


const SignTypedDataV4 = () => {
    const [domainName, setDomainName] = useState("Decrypt Marketplace");
    const [domainVerifyingContract, setDomainVerifyingContract] = useState("0x8F2910773e07CC0bcd333F81DAF5e2B3abA4F06A");
    const [domainVerifyingContractVersion, setDomainVerifyingContractVersion] = useState("1");

    const [name, setName] = useState("0x09b05f922a87e29874A6f04Cd809662daFCC2205");
    const [tokenAddress, setTokenAddress] = useState("0xACFa67dcc5161cc0aA25517f7a07520C41dD3046");
    const [tokenId, setTokenId] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [listingType, setListingType] = useState(0);
    const [paymentToken, setPaymentToken] = useState("0xED2411155E82aCc7e4Ce2d910c41aba36d7C99aB");
    const [value, setValue] = useState(10000000000);
    const [deadline, setDeadline] = useState(1646114315);
    const [bundleTokens, setBundleTokens] = useState("0x0000000000000000000000000000000000000000000000000000000000000000");
    const [salt, setSalt] = useState(123);
    const [r, setR] = useState();
    const [s, setS] = useState();
    const [v, setV] = useState();

    const [signature, setSignature] = useState();

    const [chainId, setChainId] = useState("not connected");
    const [recoveredAddress, setRecoveredAddress] = useState();


    const ethereum = window.ethereum;

    useEffect(() => {
        function handleNewAccounts(newAccounts) {
            setName(newAccounts);
        }
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            ethereum
                .request({ method: 'eth_requestAccounts' })
                .then(handleNewAccounts);
            ethereum.on('accountsChanged', handleNewAccounts);

            ethereum.request({
                method: 'eth_chainId',
            }).then(setChainId);
        }
    }, []);

    const getMsgParams = () => {
        const msgParams = {
            domain: {
                chainId: chainId.toString(),
                name: domainName.toString(),
                verifyingContract: domainVerifyingContract.toString(),
                version: domainVerifyingContractVersion.toString(),
            },
            message: {
                user: name.toString(),
                tokenAddress: tokenAddress.toString(),
                tokenId: tokenId.toString(),
                quantity: quantity.toString(),
                listingType: listingType.toString(),
                paymentToken: paymentToken.toString(),
                value: value.toString(),
                deadline: deadline.toString(),
                bundleTokens: bundleTokens.toString(),
                salt: salt.toString(),
            },
            primaryType: 'Order',
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' },
                ],
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
            },
        };
        return msgParams;
    }

    const sign = async () => {
        try {
            const sign = await ethereum.request({
                method: 'eth_signTypedData_v4',
                params: [name[0], JSON.stringify(getMsgParams())],
            });
            const splitSignature = ethers.utils.splitSignature(sign);
            setSignature(splitSignature);
            setR(splitSignature.r);
            setS(splitSignature.s);
            setV(splitSignature.v);
        } catch (err) {
            console.error(err);
        }
    }

    const recover = async () => {
        console.log("Recovering...")
        try {
            const joinedSignature = ethers.utils.joinSignature(signature);
            const recoveredAddressFromV4 = recoverTypedSignatureV4({
                data: getMsgParams(),
                sig: joinedSignature
            });
            setRecoveredAddress(recoveredAddressFromV4);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div>
            {/* <InputGroup className="mb-3">
                <InputGroup.Text>chainId</InputGroup.Text>
                <FormControl value={chainId} onChange={(e) => {setChainId(e.target.value)}}/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>Verifying Contract Name</InputGroup.Text>
                <FormControl value={domainName} onChange={(e) => {setDomainName(e.target.value)}}/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>Verifying Contract Address</InputGroup.Text>
                <FormControl value={domainVerifyingContract} onChange={(e) => {setDomainVerifyingContract(e.target.value)}}/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>Verifying Contract Version</InputGroup.Text>
                <FormControl value={domainVerifyingContractVersion} onChange={(e) => {setDomainVerifyingContractVersion(e.target.value)}}/>
            </InputGroup>
            <br/>
            <InputGroup className="mb-3">
                <InputGroup.Text>user</InputGroup.Text>
                <FormControl value={name} onChange={(e) => {setName(e.target.value)}}/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>tokenAddress</InputGroup.Text>
                <FormControl value={tokenAddress} onChange={(e) => {setTokenAddress(e.target.value)}}/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>tokenId</InputGroup.Text>
                <FormControl value={tokenId} onChange={(e) => {setTokenId(e.target.value)}}/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>quantity</InputGroup.Text>
                <FormControl value={quantity} onChange={(e) => {setQuantity(e.target.value)}}/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>listingType</InputGroup.Text>
                <FormControl value={listingType} onChange={(e) => {setListingType(e.target.value)}}/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>paymentToken</InputGroup.Text>
                <FormControl value={paymentToken} onChange={(e) => {setPaymentToken(e.target.value)}}/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>value</InputGroup.Text>
                <FormControl value={value} onChange={(e) => {setValue(e.target.value)}}/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>deadline</InputGroup.Text>
                <FormControl value={deadline} onChange={(e) => {setDeadline(e.target.value)}}/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>bundleTokens</InputGroup.Text>
                <FormControl value={bundleTokens} onChange={(e) => {setBundleTokens(e.target.value)}}/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>salt</InputGroup.Text>
                <FormControl value={salt} onChange={(e) => {setSalt(e.target.value)}}/>
            </InputGroup>


            <Button size="lg" onClick={sign}>Sign</Button>
            <table>
                <tr>Signature:</tr>
                <InputGroup className="mb-3">
                    <InputGroup.Text>r</InputGroup.Text>
                    <FormControl value={r} onChange={(e) => {setR(e.target.value)}}/>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>s</InputGroup.Text>
                    <FormControl value={s} onChange={(e) => {setS(e.target.value)}}/>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>v</InputGroup.Text>
                    <FormControl value={v} onChange={(e) => {setV(e.target.value)}}/>
                </InputGroup>
            </table>

            <Button size="lg" onClick={recover}>Recover address</Button>
            <p>Recovered: {recoveredAddress}</p> */}
            <p>Hello</p>
        </div>
    );
}

export default SignTypedDataV4;