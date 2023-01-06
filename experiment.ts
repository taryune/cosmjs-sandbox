import {IndexedTx, StargateClient} from "@cosmjs/stargate"
import {Tx} from "cosmjs-types/cosmos/tx/v1beta1/tx"
import {MsgSend} from "cosmjs-types/cosmos/bank/v1beta1/tx"

const rpc = "rpc.sentry-01.theta-testnet.polypore.xyz:26657"

const aliceAddress = "cosmos1g0dje5vu62fsg6vmltm9vcwujav9a0djjghq7u"

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



}

runAll()
