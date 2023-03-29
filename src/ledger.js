import ledgerSdk from '@minka/ledger-sdk'

const { LedgerSdk } = ledgerSdk

// Populate this object with bank keys you have created previously
const bankKeyPair = {
  schema: 'ed25519',
  public: 'FPnQ9Hsunijk9CUvq9KidjOLxCt/te8ZPPA6gOdNKhI=',
  secret: 'HYf+A7gKvAPBGOnZh89NvCW88rZfi69y5yU7Ujiq178=',
}

// Populate with Ledger public key data.
export const ledgerSigner = {
  schema: 'ed25519',
  public: 'FPnQ9Hsunijk9CUvq9KidjOLxCt/te8ZPPA6gOdNKhI=',
}

// Configure the Ledger SDK.
const ledger = new LedgerSdk({
  // This is the ledger instance we are going to connect to.
  ledger: 'demo',
  server: 'https://cardnet.ldg-stg.one/api/v2',
  secure: {
    aud: 'demo',
    iss: 'mint',
    keyPair: bankKeyPair,
    sub: bankKeyPair.public,
    exp: 3600
  },
})

// This function is used to notify Ledger of Entry processing final statuses.
export async function notifyLedger(entry, action, notifyStates) {
  const notifyAction = entry.actions[action]
  console.log('ledger --> notifyLedger');
  if (!notifyStates.includes(notifyAction.state)) {
    return
  }
  console.log('ledger --> notifyLedger-->1');
  const custom = {
    handle: entry.handle,
    status: notifyAction.state,
    coreId: notifyAction.coreId,
    reason: notifyAction.error.reason,
    detail: notifyAction.error.detail,
    failId: notifyAction.error.failId,
  }
  const ledgerResponse = await ledger.intent
    .from(entry.data.intent)
    .hash()
    .sign([
      {
        keyPair: bankKeyPair,
        custom,
      },
    ])
    .send()
  console.log(`SENT signature to Ledger\n${JSON.stringify(custom, null, 2)}`)
}
