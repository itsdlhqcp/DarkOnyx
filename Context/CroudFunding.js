import React, { useState, useEffect} from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

//INTERNAL IMPORT
import { crowdFundingABI, crowdFundingAddress } from "./contants";

//---fetching smart contract
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(crowdFundingAddress, crowdFundingABI, signerOrProvider);

  export const CrowdFundingContext = React.createContext();

  export const CrowdFundingProvider = ({ children }) => {
    const titleData = "Crowd Funding Contract";
    const [currentAccount, setCurrentAcccount] = useEffect("");

    const createCampaign = async (campaign) => {
        const { title, description, amount, deadline } = campaign;
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);


        console.log(currentAccount);
        try {
            const transaction = await contract.createCampaign(
                currentAccount, //owner
                title, //title
                description, //description
                ethers.utils.parseUnits(amount, 18),
                new Date(deadline).getTime() //deadline,
            );

            await transaction.wait();

            console.log("contract all sucessfully", transaction);

        } catch (error) {
            console.log("contracty call failure", error);
        }

    };
      
    const getCampaigns = async () => {
        const provider = new ethers.providers.JsonRpcProvider();
        const contract = fetchContract(provider);


        const campaigns = await contract.getCampaigns();

        const parsedCampaigns = campaigns.map((campaign, i)=> ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(
                campaign.amountCollected.toString()
            ),
            pId: i,
        }));

        return parsedCampaigns;
    };

    const getUserCampaigns = async () => {
        const provider = new ethers.providers.JsonRpcProvider();
        const contract = fetchContract(provider);

        const allCampaigns = await contract.getCampaigns();

        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });
        const currentUser = accounts[0];

        const filteredCampaigns = allCampaigns.filter(
            (campaign) => 
             campaign.owner === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        );
        
        const userData = filteredCampaigns.map((campaign, i) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(
                campaign.amountCollected.toString()
            ),
         pId: i,
        }));

        return userData;

        const donate = async (pId, amount) => {
            const web3Modal = new Web3Modal();
            const connection = await Web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            const campaignData = await contract.donateToCampaign(pId, {
                value: ethers.utils.parseEther(amount),
            });
            await campaignData.wait();
            location.reload();

            return campaignData;
        };

        const getDonations = async (pId) => {
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);

            const donations = await contract.getDonators(pId);
            const numberOfDonations = donations[0].length;

            const parsedDonations = [];

            for (let i=0; i< numberOfDonations;i++){
                parsedDonations.push({
                   donator: donations[0][i],
                   donation: ethers.utils.formatEther(donations[0][i].toString()),
                });
            }
             return parsedDonations;

        };

        //FUNCTION-TO CHECK WALLET IS EMPTY
    };
  }
