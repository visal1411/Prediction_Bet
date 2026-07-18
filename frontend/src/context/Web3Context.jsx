import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount("");
          setIsConnected(false);
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        return toast.error("Please install MetaMask!");
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const currentAccount = accounts[0];
      setAccount(currentAccount);

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
      
      const web3Signer = await web3Provider.getSigner();
      setSigner(web3Signer);

      const predictionContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
      setContract(predictionContract);

      setIsConnected(true);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect wallet.");
    }
  };

  return (
    <Web3Context.Provider value={{ account, provider, signer, contract, isConnected, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};
