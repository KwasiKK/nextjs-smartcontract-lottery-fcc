import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { contractAddresses, abi } from "../constants"
import { contractAddressesInterface } from "./contractAddressesInterface"
import { ethers, BigNumber, ContractTransaction } from "ethers"
import { useNotification } from "web3uikit"

function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId: string = parseInt(chainIdHex!).toString()
    const addresses: contractAddressesInterface = contractAddresses
    const lottoAddress = chainId in addresses ? addresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")

    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinnerAddress, setRecentWinnerAddress] = useState("")

    const dispatch = useNotification()

    const {
        runContractFunction: enterLotto,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi,
        contractAddress: lottoAddress!,
        functionName: "enterLotto",
        params: { entranceFee },
        msgValue: entranceFee,
    })
    console.log({ lottoAddress })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi,
        contractAddress: lottoAddress!,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi,
        contractAddress: lottoAddress!,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi,
        contractAddress: lottoAddress!,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = ((await getEntranceFee()) as BigNumber).toString()
        setEntranceFee(entranceFeeFromCall)
        console.log({ entranceFee })

        const numPlayersFromCall = ((await getNumberOfPlayers()) as BigNumber).toString()
        setNumPlayers(numPlayersFromCall)
        console.log({ numPlayers })

        const recentWinnerAddressFromCall = (await getRecentWinner()) as string
        setRecentWinnerAddress(recentWinnerAddressFromCall)
        console.log({ recentWinnerAddress })
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async (tx: ContractTransaction) => {
        await tx.wait(1)
        handleNewNotification()
        updateUI()
    }

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx notification",
            position: "topR",
            // icon: "bell",
        })
    }

    return (
        <div className="p-5">
            <h3>Welcome, join the lottery now</h3>
            {lottoAddress ? (
                <div>
                    <div>LotteryEntrance: {ethers.utils.formatUnits(entranceFee, "ether")}</div>
                    <button
                        className="bg-green-600 hover:bg-green-800 text-white p-2 font-bold rounded ml-auto"
                        onClick={async () => {
                            await enterLotto({
                                onSuccess: (tx) => handleSuccess(tx as ContractTransaction),
                                onError: (error) => console.log({ error }),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b2 rounded-full"></div>
                        ) : (
                            <div>Enter Lotto</div>
                        )}
                    </button>
                    <div>Number of players: {numPlayers}</div>
                    <div>Recent winner Address: {recentWinnerAddress}</div>
                </div>
            ) : (
                <div>Please switch network, no Lotto address detected</div>
            )}
        </div>
    )
}

export default LotteryEntrance
