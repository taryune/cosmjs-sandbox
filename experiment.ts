import {IndexedTx, SigningStargateClient, StargateClient} from "@cosmjs/stargate"
import {Tx} from "cosmjs-types/cosmos/tx/v1beta1/tx"
import {MsgSend} from "cosmjs-types/cosmos/bank/v1beta1/tx"
import {DirectSecp256k1HdWallet, OfflineDirectSigner} from "@cosmjs/proto-signing"
import {readFile} from "fs/promises"

const rpc = "rpc.sentry-01.theta-testnet.polypore.xyz:26657"

const aliceAddress = "cosmos1g0dje5vu62fsg6vmltm9vcwujav9a0djjghq7u"

const getAliceSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
  return DirectSecp256k1HdWallet.fromMnemonic((await readFile("./testnet.alice.mnemonic.key")).toString(), {
    prefix: "cosmos",
  })
}

const runAll = async (): Promise<void> => {
  const client = await StargateClient.connect(rpc)
  console.log("With client, chain id: ", await client.getChainId(), "height: ", await client.getHeight())
  console.log("Alice balances: ", await client.getAllBalances(aliceAddress))

  // get tx
  const faucetTx: IndexedTx = (await client.getTx(
    "540484BDD342702F196F84C2FD42D63FA77F74B26A8D7383FAA5AB46E4114A9B",
  ))!
  console.log("Faucet Tx: ", faucetTx)

  // decode tx
  const decodedTx: Tx = Tx.decode(faucetTx.tx)
  console.log("Decoded Tx: ", decodedTx)
  console.log("Decoded messages: ", decodedTx.body?.messages)
  const sendMessage: MsgSend = MsgSend.decode(decodedTx.body!.messages[0].value)
  console.log("Sent message: ", sendMessage)

  const faucet: string = sendMessage.fromAddress
  console.log("Faucet balances:", await client.getAllBalances(faucet))

  // sign tx
  const aliceSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic()
  const alice = (await aliceSigner.getAccounts())[0].address
  console.log("Alice's address from signer", alice)
  const signingClient = await SigningStargateClient.connectWithSigner(rpc, aliceSigner)
  console.log("Alice balance before:", await client.getAllBalances(alice))
  console.log("Faucet balance before:", await client.getAllBalances(faucet))

  console.log("Gas fee:", decodedTx.authInfo!.fee!.amount)
  console.log("Gas limit:", decodedTx.authInfo!.fee!.gasLimit.toString(10))

  // Execute the sendTokens Tx and store the result
  const result = await signingClient.sendTokens(
    alice,
    faucet,
    [{denom: "uatom", amount: "100000"}],
    {
      amount: [{denom: "uatom", amount: "500"}],
      gas: "200000",
    },
  )
  // Output the result of the Tx
  console.log("Transfer result:", result)


}

runAll()
