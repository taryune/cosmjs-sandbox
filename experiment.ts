import {StargateClient} from "@cosmjs/stargate"

const rpc = "rpc.sentry-01.theta-testnet.polypore.xyz:26657"

const aliceAddress = "cosmos1g0dje5vu62fsg6vmltm9vcwujav9a0djjghq7u"

const runAll = async (): Promise<void> => {
  const client = await StargateClient.connect(rpc)
  console.log("With client, chain id: ", await client.getChainId(), "height: ", await client.getHeight())
  console.log("Alice balances: ", await client.getAllBalances(aliceAddress))

}

runAll()
